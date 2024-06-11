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

