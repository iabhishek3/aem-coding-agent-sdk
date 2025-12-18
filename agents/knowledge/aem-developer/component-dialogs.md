# AEM Component Dialogs Knowledge Base

## Basic Dialog Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="Component Title"
    sling:resourceType="cq/gui/components/authoring/dialog">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <tabs
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/tabs"
                maximized="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                    <!-- Tab content here -->
                </items>
            </tabs>
        </items>
    </content>
</jcr:root>
```

## Common Field Types

### Text Field
```xml
<title
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="Title"
    fieldDescription="Enter the component title"
    name="./title"
    required="{Boolean}true"
    maxlength="{Long}100"/>
```

### Text Area
```xml
<description
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
    fieldLabel="Description"
    name="./description"
    rows="{Long}5"/>
```

### Rich Text Editor
```xml
<richText
    jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/authoring/dialog/richtext"
    fieldLabel="Content"
    name="./content"
    useFixedInlineToolbar="{Boolean}true">
    <rtePlugins jcr:primaryType="nt:unstructured">
        <format
            jcr:primaryType="nt:unstructured"
            features="bold,italic"/>
        <links
            jcr:primaryType="nt:unstructured"
            features="modifylink,unlink"/>
        <lists
            jcr:primaryType="nt:unstructured"
            features="unordered,ordered"/>
    </rtePlugins>
</richText>
```

### Checkbox
```xml
<showTitle
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
    fieldDescription="Display the title"
    name="./showTitle"
    text="Show Title"
    value="{Boolean}true"
    uncheckedValue="{Boolean}false"/>
```

### Select/Dropdown
```xml
<style
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="Style"
    name="./style">
    <items jcr:primaryType="nt:unstructured">
        <default
            jcr:primaryType="nt:unstructured"
            text="Default"
            value="default"
            selected="{Boolean}true"/>
        <primary
            jcr:primaryType="nt:unstructured"
            text="Primary"
            value="primary"/>
        <secondary
            jcr:primaryType="nt:unstructured"
            text="Secondary"
            value="secondary"/>
    </items>
</style>
```

### Path Browser (Page/Asset Picker)
```xml
<linkUrl
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
    fieldLabel="Link URL"
    name="./linkUrl"
    rootPath="/content"
    filter="hierarchyNotFile"/>

<image
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
    fieldLabel="Image"
    name="./imagePath"
    rootPath="/content/dam"
    filter="hierarchy"/>
```

### Image Upload (File Upload)
```xml
<file
    jcr:primaryType="nt:unstructured"
    sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
    fieldLabel="Upload Image"
    name="./file"
    fileNameParameter="./fileName"
    fileReferenceParameter="./fileReference"
    mimeTypes="[image/gif,image/jpeg,image/png,image/webp]"
    allowUpload="{Boolean}true"/>
```

### Multifield
```xml
<items
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
    fieldLabel="Items"
    composite="{Boolean}true">
    <field
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container"
        name="./items">
        <items jcr:primaryType="nt:unstructured">
            <title
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                fieldLabel="Title"
                name="./title"/>
            <link
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
                fieldLabel="Link"
                name="./link"
                rootPath="/content"/>
        </items>
    </field>
</multifield>
```

### Color Picker
```xml
<color
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/colorfield"
    fieldLabel="Background Color"
    name="./backgroundColor"
    showDefaultColors="{Boolean}true"
    showProperties="{Boolean}true"
    showSwatches="{Boolean}true"/>
```

### Number Field
```xml
<columns
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
    fieldLabel="Number of Columns"
    name="./columns"
    min="{Long}1"
    max="{Long}12"
    step="{Long}1"
    value="{Long}3"/>
```

### Hidden Field
```xml
<componentType
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/hidden"
    name="./componentType"
    value="hero"/>
```

## Conditional Fields (Show/Hide)

```xml
<linkType
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/select"
    fieldLabel="Link Type"
    name="./linkType"
    granite:class="cq-dialog-dropdown-showhide">
    <granite:data
        jcr:primaryType="nt:unstructured"
        cq-dialog-dropdown-showhide-target=".link-type-target"/>
    <items jcr:primaryType="nt:unstructured">
        <internal
            jcr:primaryType="nt:unstructured"
            text="Internal Page"
            value="internal"/>
        <external
            jcr:primaryType="nt:unstructured"
            text="External URL"
            value="external"/>
    </items>
</linkType>

<internalLink
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
    fieldLabel="Internal Link"
    name="./internalLink"
    rootPath="/content"
    granite:class="hide link-type-target"
    granite:rel="internal"/>

<externalLink
    jcr:primaryType="nt:unstructured"
    sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
    fieldLabel="External URL"
    name="./externalLink"
    granite:class="hide link-type-target"
    granite:rel="external"/>
```

## Complete Dialog Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
          xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="nt:unstructured"
    jcr:title="Hero Component"
    sling:resourceType="cq/gui/components/authoring/dialog"
    extraClientlibs="[cq.authoring.dialog.all]">
    <content
        jcr:primaryType="nt:unstructured"
        sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <tabs
                jcr:primaryType="nt:unstructured"
                sling:resourceType="granite/ui/components/coral/foundation/tabs"
                maximized="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                    <content
                        jcr:primaryType="nt:unstructured"
                        jcr:title="Content"
                        sling:resourceType="granite/ui/components/coral/foundation/container"
                        margin="{Boolean}true">
                        <items jcr:primaryType="nt:unstructured">
                            <columns
                                jcr:primaryType="nt:unstructured"
                                sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                                margin="{Boolean}true">
                                <items jcr:primaryType="nt:unstructured">
                                    <column
                                        jcr:primaryType="nt:unstructured"
                                        sling:resourceType="granite/ui/components/coral/foundation/container">
                                        <items jcr:primaryType="nt:unstructured">
                                            <!-- Fields here -->
                                        </items>
                                    </column>
                                </items>
                            </columns>
                        </items>
                    </content>
                    <style
                        jcr:primaryType="nt:unstructured"
                        jcr:title="Style"
                        sling:resourceType="granite/ui/components/coral/foundation/container">
                        <!-- Style fields -->
                    </style>
                </items>
            </tabs>
        </items>
    </content>
</jcr:root>
```
