import { exec } from "child_process";
import fs from "fs";
import path from "path";

const folders = [
  "services/delivery-service",
  "services/notification-service",
  "services/order-service",
  "services/payment-service",
  "services/restaurant-service",
  "services/user-service",
  "admin-panel",
  "web-client",
];

folders.forEach((folder) => {
  console.log(`Running npm audit for ${folder}...`);
  
  exec("npm audit --json", { cwd: folder }, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error in ${folder}:`, err);
      return;
    }

    const jsonPath = path.join(folder, "npm-audit.json");
    fs.writeFileSync(jsonPath, stdout, "utf-8");
    console.log(`JSON audit report saved at ${jsonPath}`);

    // Convert JSON → HTML using npx
    const htmlPath = path.join(folder, "npm-audit.html");
    exec(`npx npm-audit-html -i npm-audit.json -o npm-audit.html`, { cwd: folder }, (err2, stdout2, stderr2) => {
      if (err2) {
        console.error(`HTML conversion failed for ${folder}:`, stderr2 || err2);
      } else {
        console.log(`HTML audit report saved at ${htmlPath}`);
      }
    });
  });
});
