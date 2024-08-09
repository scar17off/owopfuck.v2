var I = 0;
if(location.host == "ourworldofpixels.com") I = 0;

const events = {
    "loaded": I + 1,
    "init": I + 2,
    "tick": I + 3,
    "misc": {
        "toolsRendered": I + 4,
        "toolsInitialized": I + 5,
        "logoMakeRoom": I + 6,
        "worldInitialized": I + 7,
        "windowAdded": I + 8,
        "captchaToken": I + 9,
        "loadingCaptcha": I + 10
    },
    "renderer": {
        "addChunk": I + 11,
        "rmChunk": I + 12,
        "updateChunk": I + 13
    },
    "camera": {
        "moved": I + 14,
        "zoom": I + 15
    },
    "net": {
        "connecting": I + 16,
        "connected": I + 17,
        "disconnected": I + 18,
        "playerCount": I + 19,
        "chat": I + 20,
        "devChat": I + 21,
        "world": {
            "leave": I + 22,
            "join": I + 23,
            "joining": I + 24,
            "setId": I + 25,
            "playersMoved": I + 26,
            "playersLeft": I + 27,
            "tilesUpdated": I + 28,
            "teleported": I + 29
        },
        "chunk": {
            "load": I + 30,
            "unload": I + 31,
            "set": I + 32,
            "lock": I + 33,
            "allLoaded": I + 34
        },
        "sec": {
            "rank": I + 35
        },
        "maxCount": I + 36,
        "donUntil": I + 37
    }
}

export default events;