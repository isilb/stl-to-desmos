# STL to Desmos
## How to use this code

Hello!  This repository was inspired by [Desmos to 3D Model](https://github.com/harry7557558/desmos-to-3d-model), and looks to go in the other direction.  Use cases include being a simple web application for viewing STL files.  Copying and pasting the Javascript into the browser dev console should allow the user to click the "Sign Up" button in the upper right corner of [Desmos](https://www.desmos.com/3d) and upload an STL file.
![image](https://github.com/user-attachments/assets/3a96eef6-0efd-44d8-98da-c4fb9e378d10)

After parsing the data, the user will receive some equations to copy and paste into Desmos input areas.  Right now, the only checks are simple orthogonality checks in the STL data, so it is only capable of parsing very simple objects (planes, cubes, etc).

## Current/Future Work
- Parse more complex geometries
- Error reduction in complex geometry parsing
- Other bug fixes
- Make easier to use / more like [MeshlabJS](https://www.meshlabjs.net/)
- Provide compatibility with other 3D object files
