const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const pagesPath = path.join(__dirname, 'src', 'pages');
const files = walkSync(pagesPath).filter(f => f.endsWith('.jsx'));

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Header is moved to layout now, from `../components/Header` to `../../components/layout/Header`
  content = content.replace(/from ['"]\.\.\/components\/Header['"]/g, 'from "../../components/layout/Header"');
  
  // Landing components from `../components/HeroSection` to `../../components/landing/HeroSection`
  content = content.replace(/from ['"]\.\.\/components\/(HeroSection|LandingStatsCards|FeaturesSection|HowItWorksSection|CTASection)['"]/g, 'from "../../components/landing/$1"');
  
  // Dashboard components from `../components/dashboard/` to `../../components/dashboard/`
  content = content.replace(/from ['"]\.\.\/components\/dashboard\//g, 'from "../../components/dashboard/"');
  
  // Footer from `../layout/Footer` to `../../layout/Footer`
  content = content.replace(/from ['"]\.\.\/layout\//g, 'from "../../layout/"');
  
  // Utils from `../utils/` to `../../utils/`
  content = content.replace(/from ['"]\.\.\/utils\//g, 'from "../../utils/"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed imports in', filePath);
  }
});

const linksTablePath = path.join(__dirname, 'src', 'components', 'dashboard', 'LinksTable.jsx');
if (fs.existsSync(linksTablePath)) {
  let c = fs.readFileSync(linksTablePath, 'utf8');
  if (c.includes('from "../utils/api"')) {
    c = c.replace(/from ['"]\.\.\/utils\/api['"]/g, 'from "../../utils/api"');
    fs.writeFileSync(linksTablePath, c, 'utf8');
    console.log('Fixed imports in LinksTable.jsx');
  }
}
