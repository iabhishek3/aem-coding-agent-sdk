# AEM Project Structure Knowledge

## Standard AEM Archetype Structure

```
aem-project/
├── all/                          # Combined package (embeds all modules)
│   └── pom.xml
├── core/                         # Java backend (OSGi bundles)
│   ├── src/main/java/
│   │   └── com/company/aem/
│   │       ├── core/
│   │       │   ├── models/       # Sling Models
│   │       │   ├── services/     # OSGi Services
│   │       │   ├── servlets/     # Sling Servlets
│   │       │   ├── filters/      # Servlet Filters
│   │       │   ├── listeners/    # Event Listeners
│   │       │   ├── schedulers/   # OSGi Schedulers
│   │       │   └── workflows/    # Workflow Steps
│   │       └── Constants.java
│   └── src/test/java/            # Unit tests
├── ui.apps/                      # AEM components & templates
│   └── src/main/content/jcr_root/
│       └── apps/company/
│           ├── components/
│           │   ├── content/      # Content components
│           │   ├── structure/    # Page structure components
│           │   └── form/         # Form components
│           ├── templates/        # Editable templates
│           ├── policies/         # Template policies
│           └── i18n/             # Translations
├── ui.content/                   # Sample content
├── ui.config/                    # OSGi configurations
│   └── src/main/content/jcr_root/
│       └── apps/company/osgiconfig/
│           ├── config/           # All environments
│           ├── config.author/    # Author only
│           ├── config.publish/   # Publish only
│           ├── config.dev/       # Dev environment
│           ├── config.stage/     # Stage environment
│           └── config.prod/      # Production
├── ui.frontend/                  # Frontend build (webpack)
│   ├── src/main/
│   │   ├── webpack/
│   │   └── site/
│   │       ├── scripts/
│   │       └── styles/
│   └── clientlib.config.js
├── dispatcher/                   # Dispatcher configuration
│   └── src/conf.d/
└── pom.xml                       # Parent POM
```

## Key File Locations

### Component Files
```
ui.apps/src/main/content/jcr_root/apps/<project>/components/<type>/<component-name>/
├── .content.xml                  # Component definition
├── _cq_dialog/.content.xml       # Touch UI dialog
├── _cq_editConfig.xml            # Edit configuration
├── _cq_template/.content.xml     # Default content
├── <component-name>.html         # HTL template
├── clientlibs/                   # Component-specific clientlibs (optional)
└── README.md                     # Component documentation
```

### Sling Model Location
```
core/src/main/java/com/<company>/core/models/<ComponentName>Model.java
core/src/test/java/com/<company>/core/models/<ComponentName>ModelTest.java
```

### OSGi Configuration
```
ui.config/src/main/content/jcr_root/apps/<project>/osgiconfig/config.<runmode>/
├── com.day.cq.wcm.core.impl.VersionManagerImpl.cfg.json
├── org.apache.sling.commons.log.LogManager.factory.config-<name>.cfg.json
└── com.<company>.core.services.impl.<ServiceImpl>.cfg.json
```

## Important Paths

| Path | Purpose |
|------|---------|
| `/apps` | Application code (components, templates) |
| `/conf` | Editable templates and policies |
| `/content` | Site content |
| `/content/dam` | Digital assets |
| `/content/experience-fragments` | Experience fragments |
| `/etc/clientlibs` | Legacy clientlibs location |
| `/var` | System variable data |
| `/home/users` | User accounts |
| `/home/groups` | User groups |

## POM Dependencies (Core Bundle)

```xml
<!-- Sling Models -->
<dependency>
    <groupId>org.apache.sling</groupId>
    <artifactId>org.apache.sling.models.api</artifactId>
</dependency>

<!-- AEM APIs -->
<dependency>
    <groupId>com.adobe.aem</groupId>
    <artifactId>aem-sdk-api</artifactId>
</dependency>

<!-- Testing -->
<dependency>
    <groupId>io.wcm</groupId>
    <artifactId>io.wcm.testing.aem-mock.junit5</artifactId>
    <scope>test</scope>
</dependency>
```
