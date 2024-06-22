# banana-js-core
## package.json
Here are the meaning of the scripts that can be run in `package.json`:
- **npm run build-banana**: builds the banana framework
- **npm run watch-banana**: watches the banana framework, builds it everytime there's a change
- **npm run build-editor**: builds the editor, it is enough to run this once, (builds the imgui_impl.ts file).
- **npm run start**: starts the application, choose **Banana Editor (Main)**.

## Project Structure
In this part all the relevant files and structures inside the files will be discussed with folder groupings

### core/
- `Application.ts`:
  - This file contains the **Application** class which represents a banana.js runtime. For example, both the editor and the game runtime are classes that extend this class. 
  - It contains the main loop which is the `_onTick()` function, (it utilizes the **requestAnimationFrame** of JS to create the loop). `onUpdate(deltaTime)` and `OnImGuiRender()` functions of layers are also called here.
  - All the events, (keyboard, mouse, window) are handled in the `onEvent(event)` function.
  - Another important function is the static `createApplication()` that needs to be overridden in the sandbox application which we will see later. 

- `CameraController.ts`:
  - This file contains the **EditorCameraController** class which is the camera used in the editor scene. It allows simple camera movement such as panning around and zoom in/out.

- `EntryPoint.ts`:
  - This is the entry point of any banana application, (with `window.onload = main`). ImGui and the **banana.Application** is initialized here. The `run()` function of **Application** class is called here to start application loop.

- `FileManager.ts`:
  - This file contains two static classes `Writer` and `Reader`.
  - `Writer` class contains static functions that mostly download files, (e.g. Save Scene).
  - `Reader` class contains static functions that lets the user select files from the integrated file picker, (e.g. Load Scene).

- `Gamepad.ts`:
  - Contains the singleton **Gamepad** class which is an abstraction around the JavaScript [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API).
  - Listens to `GamepadConnected` and `GamepadDisconnected` events.

- `GamepadInputCode.ts`:
  - Lists digital and analog gamepad inputs as enum values rather than integer values for better integration with **Input** class.

- `GUID.ts`:
  - Simply a GUID generator.

- `ImGUILayer.ts`:
  - A layer of the application, which initializes ImGui and also contains `begin()`, `end()` function for creating and finishing ImGui context.

- `Input.ts`:
  - This file contains the main input API of the engine. All the functions are static.
  - All types of input, (keyboard, mouse, gamepad) can be taken using this class especially in scripts.

- `KeyCode.ts`:
  - This file contains an enum that converts JavaScript name of keyboard keys into better understood names for both better typing and better integration with **Input** class.

- `Layer.ts`:
  - **Application** class can have multiple layers that run their own logic in their respective functions by overriding, `onAttach()`, `onUpdate()`, `onImGuiRender()`.

- `LayerStack.ts`:
  - *LayerStack* class manages multiple layers. **Application** class contains an instance of layer stack for management.
  - Layers and overlays are basically the same thing, (they are both **Layer** instances), their difference is the order in the layer stack. All the overlays come after layers.

- `Log.ts`:
  - Logs stuff to the console by internally calling `console` functions inside, so it's an abstraction of console.
  - To be honest, this class needs a lot of improvements. Things should not be logged to the web debugger, instead there should be an ImGui panel for this.

- `MouseButtonCode.ts`:
  - This file contains an enum that converts JavaScript int values of mouse buttons into better understood names for both better typing and better integration with **Input** class.

- `Window.ts`:
  - This file contains the **Window** class which is basically an abstraction around the **HTMLCanvasElement** object. 
  - We listen to canvas events here and convert them to the events that the engine can interpret.

### event/

### math/

### physics/

### render/

### scene/