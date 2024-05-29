import "https://cdn.jsdelivr.net/gh/flyover/system.ts/build/system.js";

export async function loadImgui() {
    return System.import('imgui-js')
        .then(module => {
            return module;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}

export async function loadImguiImpl() {
    return System.import('imgui-impl')
        .then(module => {
            return module;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}
