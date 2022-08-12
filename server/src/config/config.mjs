const CONFIG = {
    generalSettings: {
        apiV1BasePath: '/api/v1',
        currentAPIVersion: 'v1'
    },
    mongo: {
        defaultDb: 'relic-db',
        devDb: 'relic-db-dev',
        testDb: 'relic-db-test',
        collections: {
            users: 'users',
            events: 'events'
        },
        defaultIndexes: [
            {
                collection: 'users',
                indexes: [
                    { name: 'id', order: 1 },
                    { name: 'email', order: 1 },
                    { name: 'name', order: 1 }
                ]
            },
            {
                collection: 'events',
                indexes: [{ name: 'id', order: 1 }]
            }
        ]
    },
    systemEvents: {
        EXPIRED_ACCOUNT_REMOVED: {
            label: 'expired_account_removed',
            title: 'An expired account was removed from our database.',
            requiredRoles: ['root', 'admin'],
            type: 'system',
            severity: 'Informational'
        },
        NEW_USER_REGISTERED: {
            label: 'new_user_registered',
            title: 'A new user was registered on the app.',
            requiredRoles: ['root', 'admin'],
            type: 'system',
            severity: 'Informational'
        },
        NEW_ACCOUNT_ACTIVATED: {
            label: 'new_account_activated',
            title: 'A new account was activated on the app.',
            requiredRoles: ['root', 'admin'],
            type: 'system',
            severity: 'Informational'
        },
        NEW_USER_REGISTRATION_FAILED: {
            label: 'new_user_registration_failed',
            title: 'A new user tried to register for the app, but failed',
            requiredRoles: ['root', 'admin'],
            type: 'system',
            severity: 'Critical'
        },
        ACCOUNT_ACTIVATION_FAILED: {
            label: 'account_activation_failed',
            title: 'An attempt to activate an account was made but it failed.',
            requiredRoles: ['root', 'admin'],
            type: 'system',
            severity: 'Critical'
        }
    },
    userEvents: {}
};

export default CONFIG;
