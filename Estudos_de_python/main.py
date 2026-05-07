"""
Script para consulta de NF-e no Portal da Fazenda Nacional.
Requisitos de ambiente:
- pip install undetected-chromedriver selenium pandas beautifulsoup4
"""
import sys
import json
import time
import re
import pandas as pd
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from bs4 import BeautifulSoup
from buscar_imagem import buscar_imagem_produto

def consultar_nfe(chave_acesso: str):
    """
    Realiza a consulta da NF-e no Portal da Fazenda.
    """
    # 1. Configuração e Acesso
    if len(chave_acesso) != 44:
        print("Erro: A chave de acesso deve ter exatamente 44 dígitos.", file=sys.stderr, flush=True)
        return

    url = "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ%20gAVw2g="
    
    # Configurações otimizadas para rodar no Ubuntu/Linux sem ser detectado
    options = uc.ChromeOptions()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-infobars")
    # Define um User-Agent fixo e estável para Linux
    options.add_argument("user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Cria um diretório de perfil único para evitar cache de sessão "suja"
    import uuid
    options.add_argument(f"--user-data-dir=/tmp/nfe_profile_{uuid.uuid4().hex}")
    # Nota: Sem modo --headless, pois o captcha precisará ser resolvido manualmente.
    
    driver = None
    try:
        print("Iniciando o navegador...", file=sys.stderr, flush=True)
        # Adicionado version_main=147 mantendo sua customização
        driver = uc.Chrome(options=options, version_main=147)
        
        # Limpeza agressiva de sessão (Sessão Suja)
        driver.delete_all_cookies() # Limpa cookies da sessão residual
        driver.get(url)
        
        # Localiza o input pelo ID fornecido e insere a chave de acesso
        wait = WebDriverWait(driver, 40)
        input_chave = wait.until(EC.presence_of_element_located(
            (By.ID, "ctl00_ContentPlaceHolder1_txtChaveAcessoResumo")
        ))
        input_chave.send_keys(chave_acesso)
        
        # 2. Fluxo Híbrido de Captcha
        print("Aguardando resolução manual do hCaptcha...", file=sys.stderr, flush=True)
        
        captcha_resolvido = False
        tempo_maximo_espera = 600  # Tempo máximo: 10 minutos (600 segundos) para captchas difíceis
        inicio = time.time()
        
        # Loop de verificação (polling) a cada 2 segundos
        while time.time() - inicio < tempo_maximo_espera:
            try:
                page_source_lower = driver.page_source.lower()
                
                # Verificação de Erro de Sessão
                if any(erro in page_source_lower for erro in ["sessão inválida", "expirou", "erro inesperado", "não foi possível"]):
                    print("\nDetectada página de erro ou sessão expirada! Recarregando a página (Refresh)...", file=sys.stderr, flush=True)
                    driver.delete_all_cookies()
                    driver.refresh()
                    time.sleep(3) # Aguarda recarregar
                    
                    # Tenta preencher a chave novamente se o campo estiver presente
                    try:
                        input_re = driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_txtChaveAcessoResumo")
                        input_re.clear()
                        input_re.send_keys(chave_acesso)
                        print("Chave preenchida novamente após o refresh.", file=sys.stderr, flush=True)
                    except NoSuchElementException:
                        pass
                    continue
                    
                # Sincronização do Token de Captcha (Verifica se carregou o corpo de dados)
                abas = driver.find_elements(By.CSS_SELECTOR, "a[onclick*='mostraAba(3)']")
                
                # Para evitar pegar a página em transição, vamos verificar se os dados principais da NF-e apareceram
                # A Sefaz costuma ter uma div/fieldset com id="NFe" ou classe "box"
                dados_nota = driver.find_elements(By.ID, "NFe")
                dados_box = driver.find_elements(By.CSS_SELECTOR, ".box")
                
                # Confirma o acesso apenas se a aba apareceu OU a URL mudou E a página conteve os dados
                url_ok = "consulta" in driver.current_url.lower() and "recaptcha" not in driver.current_url.lower()
                
                if (len(abas) > 0 or url_ok) and (len(dados_nota) > 0 or len(dados_box) > 0):
                    captcha_resolvido = True
                    break
            except WebDriverException:
                pass
                
            time.sleep(2)
            
        if not captcha_resolvido:
            print("Tempo limite de 10 minutos excedido. O captcha não foi resolvido.", file=sys.stderr, flush=True)
            return
            
        # 3. Estabilização e Navegação
        print("Acesso detectado! Aguardando estabilização dos scripts da Sefaz...", file=sys.stderr, flush=True)
        # Delay obrigatório de 10s para que o Portal da Fazenda carregue tudo e não falhe na chamada de js
        time.sleep(10)
        
        print("Mudando para a aba 'Produtos e Serviços'...", file=sys.stderr, flush=True)
        
        # Clique Inteligente: tenta clicar via elemento, se falhar ou estiver oculto, usa execute_script
        try:
            aba_produtos = driver.find_element(By.CSS_SELECTOR, "a[onclick*='mostraAba(3)']")
            # scroll para a aba caso não esteja na tela, antes de clicar
            driver.execute_script("arguments[0].scrollIntoView(true);", aba_produtos)
            aba_produtos.click()
        except Exception:
            # Fallback seguro
            driver.execute_script("mostraAba(3);")
        
        # Aguarda 10 segundos pelo carregamento. Se não carregar, executa novamente como fallback
        try:
            wait = WebDriverWait(driver, 10)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='fixo-prod-serv-descricao']")))
        except TimeoutException:
            print("A aba parece não ter carregado na primeira tentativa. Forçando mostraAba(3) novamente...", file=sys.stderr, flush=True)
            driver.execute_script("mostraAba(3);")
            # Tenta aguardar mais uma vez, caso de timeout aqui ele vai cair no except TimeoutException geral
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='fixo-prod-serv-descricao']"))
            )
            
        print("Aba de produtos carregada. Iniciando extração dos dados...", file=sys.stderr, flush=True)
        
        # 3.5 Comando de Expansão em Massa
        print("Expandindo detalhes dos produtos...", file=sys.stderr, flush=True)
        try:
            driver.execute_script("document.querySelectorAll('.toggle').forEach(el => el.click());")
            time.sleep(3) # Aguarda renderização das tabelas
            
            # Salva o log HTML após a expansão para depuração
            with open("debug_page.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("Página com detalhes expandidos salva em 'debug_page.html'.", file=sys.stderr, flush=True)
        except Exception as e:
            print(f"Aviso: Houve uma falha ao tentar expandir tabelas: {e}", file=sys.stderr, flush=True)
            
        # 4. Extração de Dados Flexível com BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        produtos = []
        
        # Encontra todas as descrições usando classes parciais
        descricoes_elementos = soup.find_all(class_=lambda x: x and 'fixo-prod-serv-descricao' in x)
        
        for desc in descricoes_elementos:
            # Pega o contêiner do produto (para que qtd/vu/ean sejam relativos ao próprio produto)
            container = desc.find_parent(['tr', 'table', 'fieldset', 'div'])
            
            if not container:
                continue
                
            nome = desc.get_text(strip=True)
            if not nome:
                continue

            if nome.lower() == "descrição":
                continue
                
            # Extrai Quantidade
            qtd_elem = container.find(class_=lambda x: x and 'fixo-prod-serv-qtd' in x)
            qtd = qtd_elem.get_text(strip=True) if qtd_elem else ""
            
            # Extrai Valor Unitário
            # --- Busca pelo Valor Unitário de Comercialização ---
            # --- Extração Precisa do Valor Unitário (Tabela Interna) ---
            # 1. Dentro do seu loop de produtos, localize a tabela de detalhes
            # No HTML da Sefaz, cada produto fica em uma <table class="toggle box">
            # e seus detalhes em uma tabela IRMÃ: <table class="toggable box">
            
            tabela_pai = container.find_parent('table')
            tabela_detalhes = None
            
            if tabela_pai:
                tabela_detalhes = tabela_pai.find_next_sibling('table', class_=re.compile(r'toggable|box', re.IGNORECASE))

            if tabela_detalhes:
                # 2. Localizamos diretamente a label do Valor Unitário
                label_vu = tabela_detalhes.find('label', string=re.compile(r'Valor unitário de comercialização', re.IGNORECASE))
                
                if label_vu:
                    # 3. O valor real está na tag <span> logo em seguida, na mesma célula
                    span_vu = label_vu.find_next_sibling('span')
                    if span_vu:
                        vu = span_vu.get_text(strip=True)
                    else:
                        # Fallback: pega no parent (td)
                        vu = re.sub(r'(?i)Valor unitário de comercialização', '', label_vu.parent.get_text(strip=True)).strip(":- ")
                else:
                    vu = "Não encontrado"
            else:
                vu = "Tabela de detalhes não encontrada"
                
            # 3.5 Fallback Técnico (vUnCom)
            if vu in ["Não encontrado", "Tabela de detalhes não encontrada", ""]:
                v_unit = container.find(attrs={"id": re.compile(r'vUnCom', re.IGNORECASE)}) or container.find(attrs={"class": re.compile(r'vUnCom', re.IGNORECASE)})
                if v_unit:
                    vu = v_unit.get_text(strip=True)
                    
            # 4. Logs de Depuração
            if vu in ["Não encontrado", "Tabela de detalhes não encontrada", ""]:
                print(f"DEBUG: Tabela de detalhes encontrada para o produto? {bool(tabela_detalhes)}", file=sys.stderr, flush=True)
            
            # Extrai Código EAN (Busca na tabela de detalhes)
            ean = "Não encontrado"
            
            if tabela_detalhes:
                # 1. Localizamos a label do EAN
                label_ean = tabela_detalhes.find('label', string=re.compile(r'Código EAN Tributável|Código EAN Comercial|EAN|GTIN', re.IGNORECASE))
                
                if label_ean:
                    # 2. O valor real está na tag <span> logo em seguida, na mesma célula
                    span_ean = label_ean.find_next_sibling('span')
                    if span_ean:
                        ean = span_ean.get_text(strip=True)
                    else:
                        # Fallback: pega no parent (td) e limpa o nome da label
                        ean = re.sub(r'(?i)Código EAN Tributável|Código EAN Comercial|Código EAN|EAN|GTIN', '', label_ean.parent.get_text(strip=True)).strip(":- \n")
            
            # 3. Fallback Técnico para EAN (cEANTrib ou cEAN no XML)
            if ean in ["", "Não encontrado"]:
                base_busca = tabela_detalhes if tabela_detalhes else container
                v_ean = base_busca.find(attrs={"id": re.compile(r'cEANTrib|cEAN', re.IGNORECASE)}) or base_busca.find(attrs={"class": re.compile(r'cEANTrib|cEAN', re.IGNORECASE)})
                if v_ean:
                    ean = v_ean.get_text(strip=True)

            try:
                vu_limpo = vu.replace('R$', '').replace('.', '').replace(',', '.').strip()
                vu_float = float(vu_limpo)  
            except ValueError:
                vu_float = 0.0
            
            try:
                qtd_limpo = float(qtd.replace(',', '.').strip())
                qtd_float = int(qtd_limpo)
            except ValueError:
                qtd_float = 0

            # Busca imagem do produto via Google Custom Search API
            imagem_url = buscar_imagem_produto(nome)

            produtos.append({
                "NomeProduto": nome,
                "Unidade": qtd_float,
                "PrecoVista": round(vu_float * 1.15, 2),
                "PrecoRevista": round(vu_float * 1.50, 2),
                "PrecoAdquirido": vu_float,
                "CodigoBarra": ean if ean else "Não encontrado",
                "ImagemURL": imagem_url
            })
            
        # 5. Saída
        if produtos:
            print("\nExtração concluída! Dados obtidos:\n", file=sys.stderr, flush=True)
            df = pd.DataFrame(produtos)
            print(df.to_string(index=False), file=sys.stderr, flush=True)
            
            # Saída JSON limpa no stdout (único dado que o C# vai ler)
            print(json.dumps(produtos, ensure_ascii=False), flush=True)
            
            # 5.1. Formatação do Arquivo Excel
            nome_arquivo = f"nfe_{chave_acesso_vindo_frontend}.xlsx"
            try:
                with pd.ExcelWriter(nome_arquivo, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False, sheet_name='Produtos')
                    
                    # Ajuste automático de largura das colunas
                    worksheet = writer.sheets['Produtos']
                    for column in worksheet.columns:
                        max_length = 0
                        column_letter = column[0].column_letter
                        
                        for cell in column:
                            try:
                                if len(str(cell.value)) > max_length:
                                    max_length = len(cell.value)
                            except:
                                pass
                        
                        adjusted_width = (max_length + 2)
                        worksheet.column_dimensions[column_letter].width = adjusted_width
                        
                    print(f"\nDados formatados salvos no arquivo: {nome_arquivo}", file=sys.stderr, flush=True)
                    
            except Exception as e:
                print(f"Erro ao salvar o arquivo Excel: {e}", file=sys.stderr, flush=True)
                print("Salvando em formato CSV como fallback...", file=sys.stderr, flush=True)
                try:
                    nome_csv = f"nfe_{chave_acesso_vindo_frontend}.csv"
                    df.to_csv(nome_csv, index=False, encoding='utf-8-sig')
                    print(f"Dados salvos no arquivo CSV: {nome_csv}", file=sys.stderr, flush=True)
                except Exception as e_csv:
                    print(f"Erro ao salvar CSV: {e_csv}", file=sys.stderr, flush=True)

        else:
            print("Nenhum produto foi encontrado na NF-e ou houve falha na extração. Confira a chave de acesso.", file=sys.stderr, flush=True)

    # 6. Tratamento de Erro Reforçado
    except TimeoutException:
        print("Erro: Tempo limite excedido ao aguardar o carregamento da página ou de um elemento obrigatório.", file=sys.stderr, flush=True)
        if driver:
            try:
                driver.save_screenshot("erro_timeout.png")
                print("Screenshot salva como 'erro_timeout.png' na mesma pasta para debug.", file=sys.stderr, flush=True)
            except Exception as ss_erro:
                print(f"Não foi possível salvar a screenshot: {ss_erro}", file=sys.stderr, flush=True)
                
    except NoSuchElementException as e:
        print(f"Erro: Um elemento obrigatório não foi encontrado no HTML. Detalhes: {e}", file=sys.stderr, flush=True)
    except WebDriverException as e:
        print(f"Erro no navegador: {e}", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"Erro inesperado: {e}", file=sys.stderr, flush=True)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

if __name__ == "__main__":
    # Chave teste a'tualizada conforme seu último commit
    if len(sys.argv) > 1:
        chave_acesso_vindo_frontend = sys.argv[1]
        consultar_nfe(chave_acesso_vindo_frontend)
    else:
        print("erro ao receber chave do front-end: nenhum argumento fornecido.", file=sys.stderr, flush=True)
