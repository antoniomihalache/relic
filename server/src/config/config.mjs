const CONFIG = {
    generalSettings: {
        apiV1BasePath: '/api/v1',
        currentAPIVersion: 'v1'
    },
    mongo: {
        defaultDb: 'relic-db',
        collections: {
            users: 'users'
        },
        defaultIndexes: [
            {
                collection: 'users',
                indexes: [
                    { name: 'id', order: 1 },
                    { name: 'email', order: 1 },
                    { name: 'name', order: 1 }
                ]
            }
        ]
    }
};

export default CONFIG;
