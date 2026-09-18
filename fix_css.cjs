const fs = require('fs');
let css = fs.readFileSync('src/styles/global.css', 'utf8');

// 1. Remove sakura background gradient block
css = css.replace(/\/\* ─── Sakura Background Gradient ─── \*\/[\s\S]*?min-height: 100vh;\n}\n/, '');

// 2. Remove Sakura body::before
css = css.replace(/\/\* ─── Soft Radial Light Patches ─── \*\/[\s\S]*?z-index: 0;\n}\n/, '');

// 3. Remove Theme Background Images block entirely
css = css.replace(/\/\* ─── Theme Background Images ─── \*\/[\s\S]*?(?=\/\* ─── Image Veils)/, '');

// 4. Remove Image Veils block entirely
css = css.replace(/\/\* ─── Image Veils \(for readability\) ─── \*\/[\s\S]*?(?=\* \{)/, '');

// 5. Remove global body::before
css = css.replace(/body::before \{[\s\S]*?pointer-events: none;\n}\n/, '');

// Insert new backgrounds right before `* {`
const newBackgrounds = `/* ─── Theme Backgrounds ─── */

[data-theme="sakura"] body,
body[data-theme="sakura"] {
  background: 
    linear-gradient(160deg, rgba(255, 248, 242, 0.55) 0%, rgba(248, 229, 236, 0.65) 45%, rgba(237, 212, 224, 0.75) 100%),
    url('/backgrounds/sakura.jpg') center/cover no-repeat fixed;
  min-height: 100vh;
}

[data-theme="ocean"] body,
body[data-theme="ocean"] {
  background: 
    linear-gradient(180deg, rgba(242, 247, 252, 0.55) 0%, rgba(221, 233, 245, 0.75) 100%),
    url('/backgrounds/ocean.jpg') center/cover no-repeat fixed;
  min-height: 100vh;
}

[data-theme="matcha"] body,
body[data-theme="matcha"] {
  background: 
    linear-gradient(180deg, rgba(246, 250, 242, 0.55) 0%, rgba(226, 237, 216, 0.75) 100%),
    url('/backgrounds/matcha.jpg') center/cover no-repeat fixed;
  min-height: 100vh;
}

[data-theme="midnight"] body,
body[data-theme="midnight"] {
  background: 
    linear-gradient(180deg, rgba(26, 27, 46, 0.55) 0%, rgba(35, 36, 61, 0.75) 100%),
    url('/backgrounds/midnight.jpg') center/cover no-repeat fixed;
  min-height: 100vh;
}

`;

css = css.replace('* {\n  box-sizing: border-box;', newBackgrounds + '* {\n  box-sizing: border-box;');

fs.writeFileSync('src/styles/global.css', css);
console.log("Done");
