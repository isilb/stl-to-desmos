# STL to Desmos
Copying and pasting the Javascript into the console should allow the user to click the "Sign Up" button in the upper right corner of [Desmos](https://www.desmos.com/3d) and upload an STL file.
![image](https://github.com/user-attachments/assets/3a96eef6-0efd-44d8-98da-c4fb9e378d10)

Right now, the only checks are simple orthogonality checks in the STL data, so it is only capable of parsing very simple objects (planes, cubes, etc).  I plan on building this out in the near future to deduce more complex geometry.

This project was inspired by this repository, which will go in the other direction: https://github.com/harry7557558/desmos-to-3d-model.
