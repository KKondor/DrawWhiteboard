# [1.4.0](https://github.com/KKondor/DrawWhiteboard/compare/v1.3.0...v1.4.0) (2026-09-03)


### Bug Fixes

* fixed the download png button not working in the desktop app ([9211d46](https://github.com/KKondor/DrawWhiteboard/commit/9211d4626311351593eeba78a5b012c7c04829be))


### Features

* added a keybind to download png ([75f6eee](https://github.com/KKondor/DrawWhiteboard/commit/75f6eee773a9f064753b16fcf307eb0a46cd97ab))

# [1.3.0](https://github.com/KKondor/DrawWhiteboard/compare/v1.2.0...v1.3.0) (2026-09-03)


### Features

* added undo button ([bdae5f9](https://github.com/KKondor/DrawWhiteboard/commit/bdae5f9ac47054dc92a387bd0c78db0c915d4e49))

# [1.2.0](https://github.com/KKondor/DrawWhiteboard/compare/v1.1.1...v1.2.0) (2026-09-03)


### Bug Fixes

* removed leftover onMouseDown ([c23970f](https://github.com/KKondor/DrawWhiteboard/commit/c23970f20af742a5e602b2c1a5e395fc0529375a))


### Features

* added backend functions to handle undo ([a6ef00f](https://github.com/KKondor/DrawWhiteboard/commit/a6ef00f7fb22c2d6ed3d11bbcf4b3ea0d0f59ddb))
* added keybind for toggling eraser ([b6653ab](https://github.com/KKondor/DrawWhiteboard/commit/b6653ab562ece7b1f9b34bc81d4b7954bafe915c))

## [1.1.1](https://github.com/KKondor/DrawWhiteboard/compare/v1.1.0...v1.1.1) (2026-09-02)


### Bug Fixes

* fixed touchscreen and other alternative control methods not working ([3e97844](https://github.com/KKondor/DrawWhiteboard/commit/3e97844067ba3c823cccb12e710da541045edda9))
* fixed touchscreen and other alternative control methods not working ([8b420d5](https://github.com/KKondor/DrawWhiteboard/commit/8b420d5ad14a4dd03fda1ddb78b085d61589e337))

# [1.1.0](https://github.com/KKondor/DrawWhiteboard/compare/v1.0.0...v1.1.0) (2026-09-02)


### Features

* added a Download PNG button that allows you to export the canvas ([31e2c1f](https://github.com/KKondor/DrawWhiteboard/commit/31e2c1f7fda810f65cacbba022a62cbca3e5991e))

# 1.0.0 (2026-09-01)


### Bug Fixes

* fixed dockerfile not working with render ([fcdbc51](https://github.com/KKondor/DrawWhiteboard/commit/fcdbc516330968224fd4f4e99fcc3fbbbde4a20b))
* fixed not actually using Cors ([7d28279](https://github.com/KKondor/DrawWhiteboard/commit/7d282799f38c81af83a8592828429351eabf31e8))


### Features

* added AddPoint funvtion to StrokeStore. ([ef32451](https://github.com/KKondor/DrawWhiteboard/commit/ef324512f44510a23a4273bb10e2527ea8b58dfa))
* added automatic versioning ([428ede9](https://github.com/KKondor/DrawWhiteboard/commit/428ede9ca43cb0bd29e5a5375f6d945922dd8bd1))
* added color and thickness pickers and added basic style ([3000546](https://github.com/KKondor/DrawWhiteboard/commit/3000546f4992625caf1f115098dc61a2c05c3eba))
* added functionality to receive websockets ([f54c5fd](https://github.com/KKondor/DrawWhiteboard/commit/f54c5fddff8fa31b40e83186340011a602c22a08))
* added functionality to send websockets by drawing ([0173c89](https://github.com/KKondor/DrawWhiteboard/commit/0173c893c64053c994f2612cf22870c1b466b6ca))
* added initial tauri desktop app ([12febe9](https://github.com/KKondor/DrawWhiteboard/commit/12febe9351004d162f1bc3b9025fe03012f511ca))
* added local whiteboard frontend ([cd73149](https://github.com/KKondor/DrawWhiteboard/commit/cd73149788e6716de95a4ef1fecbc0ce53de531b))
* added message about connecting ([1290778](https://github.com/KKondor/DrawWhiteboard/commit/1290778a323c6bccf93ed99290f8833cafd11e0e))
* added multiple cors connections ([8a7a23c](https://github.com/KKondor/DrawWhiteboard/commit/8a7a23c1dc843be9cbe9779ca8e9c44f34501407))
* added SendPoint and GetStrokeHistory functionality ([51cd924](https://github.com/KKondor/DrawWhiteboard/commit/51cd92485ff7328355131514d2ad2b03b054edde))
* added the basic setup ([d48d172](https://github.com/KKondor/DrawWhiteboard/commit/d48d172d0422480bfe1eebe24e0b9760fe24bf41))
* added various UX changes and better styling ([f932e14](https://github.com/KKondor/DrawWhiteboard/commit/f932e14b1f6d8e90687aa3bd48714a08a415f58c))
* changed Point to send all stroke related info ([ae2291a](https://github.com/KKondor/DrawWhiteboard/commit/ae2291afc7f6b5ddb2338f17db6574e0dde4f884))
* changed tauri id ([68cd88d](https://github.com/KKondor/DrawWhiteboard/commit/68cd88d1bc7c9b2849c791daf0444f71755c312c))
* reduced send delay for smoother lines ([136ac32](https://github.com/KKondor/DrawWhiteboard/commit/136ac321431f926255f40dcee17e8938e41722b9))
* wired in Cors, Singleton and Hub ([4cc9e37](https://github.com/KKondor/DrawWhiteboard/commit/4cc9e377d6974e8bb698351449d602465ab643d4))

# 1.0.0 (2026-09-01)


### Bug Fixes

* fixed dockerfile not working with render ([fcdbc51](https://github.com/KKondor/DrawWhiteboard/commit/fcdbc516330968224fd4f4e99fcc3fbbbde4a20b))
* fixed not actually using Cors ([7d28279](https://github.com/KKondor/DrawWhiteboard/commit/7d282799f38c81af83a8592828429351eabf31e8))


### Features

* added AddPoint funvtion to StrokeStore. ([ef32451](https://github.com/KKondor/DrawWhiteboard/commit/ef324512f44510a23a4273bb10e2527ea8b58dfa))
* added automatic versioning ([428ede9](https://github.com/KKondor/DrawWhiteboard/commit/428ede9ca43cb0bd29e5a5375f6d945922dd8bd1))
* added color and thickness pickers and added basic style ([3000546](https://github.com/KKondor/DrawWhiteboard/commit/3000546f4992625caf1f115098dc61a2c05c3eba))
* added functionality to receive websockets ([f54c5fd](https://github.com/KKondor/DrawWhiteboard/commit/f54c5fddff8fa31b40e83186340011a602c22a08))
* added functionality to send websockets by drawing ([0173c89](https://github.com/KKondor/DrawWhiteboard/commit/0173c893c64053c994f2612cf22870c1b466b6ca))
* added initial tauri desktop app ([12febe9](https://github.com/KKondor/DrawWhiteboard/commit/12febe9351004d162f1bc3b9025fe03012f511ca))
* added local whiteboard frontend ([cd73149](https://github.com/KKondor/DrawWhiteboard/commit/cd73149788e6716de95a4ef1fecbc0ce53de531b))
* added message about connecting ([1290778](https://github.com/KKondor/DrawWhiteboard/commit/1290778a323c6bccf93ed99290f8833cafd11e0e))
* added multiple cors connections ([8a7a23c](https://github.com/KKondor/DrawWhiteboard/commit/8a7a23c1dc843be9cbe9779ca8e9c44f34501407))
* added SendPoint and GetStrokeHistory functionality ([51cd924](https://github.com/KKondor/DrawWhiteboard/commit/51cd92485ff7328355131514d2ad2b03b054edde))
* added the basic setup ([d48d172](https://github.com/KKondor/DrawWhiteboard/commit/d48d172d0422480bfe1eebe24e0b9760fe24bf41))
* added various UX changes and better styling ([f932e14](https://github.com/KKondor/DrawWhiteboard/commit/f932e14b1f6d8e90687aa3bd48714a08a415f58c))
* changed Point to send all stroke related info ([ae2291a](https://github.com/KKondor/DrawWhiteboard/commit/ae2291afc7f6b5ddb2338f17db6574e0dde4f884))
* changed tauri id ([68cd88d](https://github.com/KKondor/DrawWhiteboard/commit/68cd88d1bc7c9b2849c791daf0444f71755c312c))
* wired in Cors, Singleton and Hub ([4cc9e37](https://github.com/KKondor/DrawWhiteboard/commit/4cc9e377d6974e8bb698351449d602465ab643d4))

# 1.0.0 (2026-09-01)


### Bug Fixes

* fixed dockerfile not working with render ([fcdbc51](https://github.com/KKondor/DrawWhiteboard/commit/fcdbc516330968224fd4f4e99fcc3fbbbde4a20b))
* fixed not actually using Cors ([7d28279](https://github.com/KKondor/DrawWhiteboard/commit/7d282799f38c81af83a8592828429351eabf31e8))


### Features

* added AddPoint funvtion to StrokeStore. ([ef32451](https://github.com/KKondor/DrawWhiteboard/commit/ef324512f44510a23a4273bb10e2527ea8b58dfa))
* added automatic versioning ([428ede9](https://github.com/KKondor/DrawWhiteboard/commit/428ede9ca43cb0bd29e5a5375f6d945922dd8bd1))
* added color and thickness pickers and added basic style ([3000546](https://github.com/KKondor/DrawWhiteboard/commit/3000546f4992625caf1f115098dc61a2c05c3eba))
* added functionality to receive websockets ([f54c5fd](https://github.com/KKondor/DrawWhiteboard/commit/f54c5fddff8fa31b40e83186340011a602c22a08))
* added functionality to send websockets by drawing ([0173c89](https://github.com/KKondor/DrawWhiteboard/commit/0173c893c64053c994f2612cf22870c1b466b6ca))
* added initial tauri desktop app ([12febe9](https://github.com/KKondor/DrawWhiteboard/commit/12febe9351004d162f1bc3b9025fe03012f511ca))
* added local whiteboard frontend ([cd73149](https://github.com/KKondor/DrawWhiteboard/commit/cd73149788e6716de95a4ef1fecbc0ce53de531b))
* added message about connecting ([1290778](https://github.com/KKondor/DrawWhiteboard/commit/1290778a323c6bccf93ed99290f8833cafd11e0e))
* added multiple cors connections ([8a7a23c](https://github.com/KKondor/DrawWhiteboard/commit/8a7a23c1dc843be9cbe9779ca8e9c44f34501407))
* added SendPoint and GetStrokeHistory functionality ([51cd924](https://github.com/KKondor/DrawWhiteboard/commit/51cd92485ff7328355131514d2ad2b03b054edde))
* added the basic setup ([d48d172](https://github.com/KKondor/DrawWhiteboard/commit/d48d172d0422480bfe1eebe24e0b9760fe24bf41))
* added various UX changes and better styling ([f932e14](https://github.com/KKondor/DrawWhiteboard/commit/f932e14b1f6d8e90687aa3bd48714a08a415f58c))
* changed Point to send all stroke related info ([ae2291a](https://github.com/KKondor/DrawWhiteboard/commit/ae2291afc7f6b5ddb2338f17db6574e0dde4f884))
* changed tauri id ([68cd88d](https://github.com/KKondor/DrawWhiteboard/commit/68cd88d1bc7c9b2849c791daf0444f71755c312c))
* wired in Cors, Singleton and Hub ([4cc9e37](https://github.com/KKondor/DrawWhiteboard/commit/4cc9e377d6974e8bb698351449d602465ab643d4))
