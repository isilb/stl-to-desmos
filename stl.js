const uploadButton = document.querySelector('.dcg-create-account');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);


function processSTLFile(file) {
    // Create a FileReader instance
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        // Validate file size
      if (file.size <= 0) {
        throw new Error('Invalid file size');
      }

        // Parse the STL data (adjust parsing logic based on STL format)
        const stlData = parseSTL(event.target.result);

        // Extract key points or features
        const keyPoints = extractFeatures(stlData);

        // Perform curve fitting or feature extraction
        const equations = deriveEquations(keyPoints);

        // Display equations in a popup
        const popup = document.createElement('div');
        popup.textContent = `Derived Equations:\n${equations.join('\n')}`;
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.padding = '20px';
        popup.style.border = '1px solid #000';

        document.body.appendChild(popup);

        setTimeout(() => {
          popup.remove();
        }, 10000); // Remove popup after 10 seconds

          console.log(`Derived Equations:\n${equations.join('\n')}`);
      } catch (error) {
        console.error('Error processing STL file:', error);
        // Handle error, e.g., display an error message
      }
    };

    reader.readAsArrayBuffer(file);
  }

// Polyfill for getUint8Array if not available
if (!DataView.prototype.getUint8Array) {
  DataView.prototype.getUint8Array = function(byteOffset, length) {
    const buffer = new Uint8Array(this.buffer, this.byteOffset + byteOffset, length);
    return buffer;
  };
}

// Function to parse STL data
function parseSTL(data) {
  const reader = new DataView(data);

  // Validate header size
  const expectedHeaderSize = 80;
  if (data.byteLength < expectedHeaderSize) {
    throw new Error('Invalid STL file: Header size too small');
  }

  // Read header
  const header = new TextDecoder().decode(reader.getUint8Array(0, expectedHeaderSize));

  // Validate header length
  if (header.length !== 80) {
    throw new Error('Invalid STL header');
  }

  // Read number of triangles
  const numTriangles = reader.getUint32(expectedHeaderSize);

  // Validate data size based on number of triangles
  const expectedDataSize = expectedHeaderSize + numTriangles * 50; // Each triangle has 12 bytes (3 floats per normal vector and vertex)
  //if (data.byteLength < expectedDataSize) {
  //  throw new Error('Invalid STL file: Data size mismatch with number of triangles');
//  }

  const triangles = [];
  for (let i = 0; i < numTriangles; i++) {
    try {
      // Calculate offsets
      const offset = expectedHeaderSize + i * 50;

      console.log('Processing triangle', i, 'Offset:', offset);


      // Read normal vector
      const normalX = reader.getFloat32(expectedHeaderSize + i * 50);
      const normalY = reader.getFloat32(expectedHeaderSize + i * 50 + 4);
      const normalZ = reader.getFloat32(expectedHeaderSize + i * 50 + 8);

      // Read vertex 1
      const vertex1X = reader.getFloat32(expectedHeaderSize + i * 50 + 12);
      const vertex1Y = reader.getFloat32(expectedHeaderSize + i * 50 + 16);
      const vertex1Z = reader.getFloat32(expectedHeaderSize + i * 50 + 20);

      // Read vertex 2
      const vertex2X = reader.getFloat32(expectedHeaderSize + i * 50 + 24);
      const vertex2Y = reader.getFloat32(expectedHeaderSize + i * 50 + 28);
      const vertex2Z = reader.getFloat32(expectedHeaderSize + i * 50 + 32);

      // Read vertex 3
      const vertex3X = reader.getFloat32(expectedHeaderSize + i * 50 + 36);
      const vertex3Y = reader.getFloat32(expectedHeaderSize + i * 50 + 40);
      const vertex3Z = reader.getFloat32(expectedHeaderSize + i * 50 + 44);

      // Validate triangle data (optional)
      if (isNaN(normalX) || isNaN(normalY) || isNaN(normalZ) ||
          isNaN(vertex1X) || isNaN(vertex1Y) || isNaN(vertex1Z) ||
          isNaN(vertex2X) || isNaN(vertex2Y) || isNaN(vertex2Z) ||
          isNaN(vertex3X) || isNaN(vertex3Y) || isNaN(vertex3Z)) {
        throw new Error('Invalid triangle data');
      }

      // Create triangle object
      const triangle = {
        normal: [normalX, normalY, normalZ],
        vertices: [
          [vertex1X, vertex1Y, vertex1Z],
          [vertex2X, vertex2Y, vertex2Z],
          [vertex3X, vertex3Y, vertex3Z]
        ]
      };

      triangles.push(triangle);
    } catch (error) {
      console.error('Error processing triangle', i, error);
    }
  }

  return triangles;
}

// Compute the cross product
function calculateNormal(v1, v2) {
    const dx = v2[0] - v1[0];
    const dy = v2[1] - v1[1];
    const dz = v2[2] - v1[2];
    const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return [dx / magnitude, dy / magnitude, dz / magnitude];
}


function isPlane(triangle) {
    const [v1, v2, v3] = triangle.vertices;

    // Calculate normal vectors
    const normal1 = calculateNormal(v1, v2);
    const normal2 = calculateNormal(v2, v3);

    // Check if normals are approximately equal
    const dotProduct = normal1[0] * normal2[0] + normal1[1] * normal2[1] + normal1[2] * normal2[2];
    return Math.abs(dotProduct - 1) < 0.001; // Adjust tolerance as needed
}

function calculatePlaneEq(normal, point) {
    const [nx, ny, nz] = normal;
    const [x1, y1, z1] = point;
    const D = -(nx * x1 + ny * y1 + nz * z1);
    return [nx, ny, nz, D];
}

// Function to derive equations
function calculatePlaneEquation(triangle) {
    // Check if the triangle forms a valid plane
    if (!isPlane(triangle)) {
        return null; // Not a plane, return null
    }

    // Calculate the plane normal vector from any two vertices
    const v1 = triangle.vertices[0];
    const v2 = triangle.vertices[1];
    const normal = calculateNormal(v1, v2);

    // Take any vertex as a point on the plane
    const point = triangle.vertices[0];

    // Calculate the plane equation coefficients (A, B, C, D) in the form Ax + By + Cz + D = 0
    const [A, B, C] = normal;
    const D = -(A * point[0] + B * point[1] + C * point[2]);

    // Return the plane equation as an object
    return { normal: [A, B, C], d: D };
}

// Central difference method for numerical differentiation
function centralDiff(x, y, h) {
    const n = x.length;
    const dydx = new Array(n);
  
    // Forward difference for the first point
    dydx[0] = (y[1] - y[0]) / h;
  
    // Central difference for interior points
    for (let i = 1; i < n - 1; i++) {
      dydx[i] = (y[i + 1] - y[i - 1]) / (2 * h);
    }
  
    // Backward difference for the last point
    dydx[n - 1] = (y[n - 1] - y[n - 2]) / h;
  
    return dydx;
}
  
// 4th-order Runge-Kutta 
function rk(f, y0, x0, h, n) {
    const y = [y0];
    const x = [x0];
  
    for (let i = 0; i < n; i++) {
      const k1 = h * f(x[i], y[i]);
      const k2 = h * f(x[i] + h / 2, y[i] + k1 / 2);
      const k3 = h * f(x[i] + h / 2, y[i] + k2 / 2);
      const k4 = h * f(x[i] + h, y[i] + k3);
  
      const y_new = y[i] + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      const x_new = x[i] + h;
  
      y.push(y_new);
      x.push(x_new);
    }
  
    return { x, y };
}

// Function to extract key points
function extractFeatures(triangles) {
    const features = [];

    // Detect planes
    for (const triangle of triangles) {
      // ... (use plane detection algorithms)
      if (isPlane(triangle)) {
        const planeEquation = calculatePlaneEquation(triangle);
        if (planeEquation) { // Check if the equation is valid (not null)
          features.push({ type: 'plane', ...planeEquation });
        }
      }
    }

    // Decide what each nth derivative means...

    return features;
  }

uploadButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    // Process the uploaded file here
    console.log('File uploaded:', file);
    processSTLFile(file);
    console.log('Done processing STL file');
  }
});
