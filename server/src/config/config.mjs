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
    },
    systemEvents: {
        EXPIRED_ACCOUNT_REMOVED: {
            type: 'expired_account_removed',
            title: 'An expired account was removed from our database.'
        },
        NEW_USER_REGISTERED: {
            type: 'new_user_registered',
            title: 'A new user was registered on the app.'
        },
        NEW_ACCOUNT_ACTIVATED: {
            type: 'new_account_activated',
            title: 'A new account was activated on the app.'
        },
        NEW_USER_REGISTRATION_FAILED: {
            type: 'new_user_registration_failed',
            title: 'A new user tried to register for the app, but failed'
        },
        ACCOUNT_ACTIVATION_FAILED: {
            type: 'account_activation_failed',
            title: 'An attempt to activate an account was made but it failed.'
        }
    }
};

export default CONFIG;
