module.exports = {
    api: {
        input: 'http://localhost:5000/swagger/v1/swagger.json',
        output: {
            target: './src/api/generated.ts',
            client: 'fetch',
            httpClient: 'axios',
            baseUrl: 'http://localhost:5000',
            schemas: 'src/api/types.ts',
        },
    },
};