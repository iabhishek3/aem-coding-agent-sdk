# AEM Local Build Skill

## Capability Description
Execute Maven builds for AEM projects, deploy to local AEM instance, and troubleshoot build failures.

## When to Use
- User needs to build and deploy AEM code
- Build fails and needs troubleshooting
- User wants to run specific Maven profiles
- Deploy to author/publish instances

## Build Commands Reference

### Full Project Build
```bash
# Build entire project and deploy to local AEM
mvn clean install -PautoInstallSinglePackage

# Build with all sub-packages
mvn clean install -PautoInstallPackage
```

### Module-Specific Builds
```bash
# Core bundle only (Java code)
mvn clean install -PautoInstallBundle -f core/pom.xml

# UI Apps only (components, templates)
mvn clean install -PautoInstallPackage -f ui.apps/pom.xml

# UI Content only (sample content)
mvn clean install -PautoInstallPackage -f ui.content/pom.xml

# UI Config only (OSGi configs)
mvn clean install -PautoInstallPackage -f ui.config/pom.xml

# UI Frontend only (clientlibs)
mvn clean install -PautoInstallFrontend -f ui.frontend/pom.xml
```

### Different Instances
```bash
# Deploy to author (default, port 4502)
mvn clean install -PautoInstallPackage

# Deploy to publish (port 4503)
mvn clean install -PautoInstallPackagePublish

# Custom port
mvn clean install -PautoInstallPackage -Daem.port=4504
```

### Skip Options
```bash
# Skip tests
mvn clean install -PautoInstallPackage -DskipTests

# Skip frontend build
mvn clean install -PautoInstallPackage -Dskip.frontend=true

# Skip all checks
mvn clean install -PautoInstallPackage -DskipTests -Dcheckstyle.skip=true -Dpmd.skip=true
```

## Common Build Errors and Fixes

### Error: Java Version Mismatch
```
[ERROR] Fatal error compiling: invalid target release: 11
```
**Fix**: Set correct Java version
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
# or
export JAVA_HOME=/path/to/jdk-11
```

### Error: Bundle Not Resolved
```
[ERROR] Bundle com.company.core cannot be resolved
```
**Fix**: Check dependencies in pom.xml, ensure all imports are satisfied
```bash
# Check bundle status in Felix console
curl -u admin:admin http://localhost:4502/system/console/bundles.json | jq '.data[] | select(.symbolicName | contains("company"))'
```

### Error: Package Install Failed
```
[ERROR] Failed to install package
```
**Fix**: Check package manager logs
```bash
# View error log
tail -f /path/to/aem/crx-quickstart/logs/error.log

# Check package status
curl -u admin:admin http://localhost:4502/crx/packmgr/service.jsp?cmd=ls
```

### Error: Frontend Build Failed
```
[ERROR] npm ERR! code ELIFECYCLE
```
**Fix**: Clear npm cache and rebuild
```bash
cd ui.frontend
rm -rf node_modules
npm cache clean --force
npm install
npm run build
```

### Error: Content Sync Conflict
```
[ERROR] Node already exists at path
```
**Fix**: Clean content before install
```bash
mvn clean install -PautoInstallPackage -Dvault.force=true
```

## Build Verification Steps

### 1. Check Bundle Status
```bash
curl -s -u admin:admin "http://localhost:4502/system/console/bundles.json" | \
  jq '.data[] | select(.state != "Active" and .symbolicName | contains("company"))'
```

### 2. Check Component Registration
```bash
curl -s -u admin:admin "http://localhost:4502/system/console/components.json" | \
  jq '.data[] | select(.name | contains("company"))'
```

### 3. Verify Package Installation
```bash
curl -s -u admin:admin "http://localhost:4502/crx/packmgr/list.jsp" | \
  grep "company"
```

### 4. Test Page Rendering
```bash
curl -s -u admin:admin "http://localhost:4502/content/company/en.html" | head -100
```

## Execution Flow

1. **Identify Build Scope**
   - Full project or specific module?
   - Which instance (author/publish)?

2. **Run Build Command**
   - Execute appropriate Maven command
   - Capture output for error analysis

3. **Handle Failures**
   - Parse error messages
   - Apply known fixes
   - Retry build

4. **Verify Deployment**
   - Check bundle status
   - Verify package installed
   - Test affected functionality

5. **Report Results**
   - Build success/failure status
   - List any warnings
   - Provide next steps if failed
