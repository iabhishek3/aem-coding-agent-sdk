# Build, Test, and Fix Workflow

## Trigger
User requests to build, test, or fix issues in AEM project.

## Workflow Overview
```
Start → Analyze Request → Execute Build → Check Results → Fix Issues → Verify → Report
          ↓                    ↓               ↓             ↓
       Determine            Run Maven      Parse Output   Apply Fixes
       Build Scope          Commands        for Errors    Automatically
```

## Workflow Steps

### Step 1: Analyze Build Request
```yaml
action: determine_scope
options:
  - full_project: "Build entire project"
  - core_only: "Build Java code only"
  - ui_apps_only: "Build components only"
  - frontend_only: "Build clientlibs only"
  - test_only: "Run tests only"
  - specific_test: "Run specific test class"
```

### Step 2: Identify Project Root
```yaml
action: find_project
tasks:
  - Look for parent pom.xml
  - Identify AEM project type (archetype version)
  - Check available profiles
  - Verify AEM instance is running (if deploying)
outputs:
  - projectRoot
  - availableProfiles
  - aemInstanceUrl
```

### Step 3: Execute Build
```yaml
action: run_build
commands:
  full_project: "mvn clean install -PautoInstallSinglePackage"
  core_only: "mvn clean install -PautoInstallBundle -f core/pom.xml"
  ui_apps_only: "mvn clean install -PautoInstallPackage -f ui.apps/pom.xml"
  frontend_only: "mvn clean install -f ui.frontend/pom.xml"
  test_only: "mvn test -f core/pom.xml"
capture:
  - stdout
  - stderr
  - exit_code
```

### Step 4: Parse Build Output
```yaml
action: analyze_output
patterns:
  compilation_error:
    regex: "\\[ERROR\\].*\\.java:\\[(\\d+),\\d+\\].*"
    extract: [file, line, message]
  test_failure:
    regex: "Failed tests:.*"
    extract: [test_class, test_method]
  dependency_error:
    regex: "Could not resolve dependencies.*"
    extract: [artifact]
  bundle_error:
    regex: "Bundle.*cannot be resolved"
    extract: [bundle_name, missing_import]
```

### Step 5: Handle Errors (Loop)
```yaml
action: fix_errors
for_each: detected_error
  steps:
    - identify_error_type
    - lookup_fix_strategy
    - apply_fix
    - log_change
max_iterations: 5
```

#### 5a: Compilation Error Fix
```yaml
error_type: compilation_error
actions:
  - Read the file at error location
  - Analyze the error message
  - Common fixes:
    - Missing import → Add import statement
    - Type mismatch → Fix type or cast
    - Missing method → Implement method
    - Syntax error → Fix syntax
  - Save file
  - Retry build
```

#### 5b: Test Failure Fix
```yaml
error_type: test_failure
actions:
  - Read test class
  - Read test data JSON
  - Read model being tested
  - Analyze assertion failure
  - Common fixes:
    - Expected value wrong → Update test or model
    - Null pointer → Add null handling
    - Model not registered → Add to context
  - Save changes
  - Rerun specific test
```

#### 5c: Dependency Error Fix
```yaml
error_type: dependency_error
actions:
  - Check pom.xml for dependency
  - Search for correct version
  - Add or update dependency
  - Verify scope (provided vs compile)
  - Rebuild
```

#### 5d: Bundle Resolution Error Fix
```yaml
error_type: bundle_error
actions:
  - Identify missing package
  - Find which bundle exports it
  - Add dependency to pom.xml
  - Verify Import-Package in bundle config
  - Rebuild
```

### Step 6: Verify Success
```yaml
action: verify_build
checks:
  - Exit code is 0
  - No ERROR in output
  - All tests passed
  - Bundle is Active (if deployed)
  - Package installed (if deployed)
```

### Step 7: Run Additional Tests
```yaml
action: run_tests
condition: build_succeeded
commands:
  - "mvn test -f core/pom.xml"
  - "mvn verify -f it.tests/pom.xml" # If integration tests exist
capture_results:
  - tests_run
  - tests_failed
  - tests_skipped
  - coverage_percent
```

### Step 8: Report Results
```yaml
action: generate_report
template: |
  ## Build Results

  **Status**: {status}
  **Duration**: {duration}

  ### Changes Made
  {list_of_fixes}

  ### Test Results
  - Tests Run: {tests_run}
  - Passed: {tests_passed}
  - Failed: {tests_failed}

  ### Deployment Status
  - Bundle Status: {bundle_status}
  - Package Status: {package_status}

  ### Next Steps
  {recommendations}
```

## Error Recovery Strategies

### Strategy: Incremental Fix
```yaml
approach: fix_one_at_a_time
reason: Avoid cascading changes
steps:
  1. Fix first error
  2. Rebuild
  3. Check if error resolved
  4. Move to next error
  5. Repeat until clean
```

### Strategy: Rollback
```yaml
trigger: fixes_not_working
actions:
  - git stash current changes
  - Identify last working state
  - Report to user for guidance
```

### Strategy: Skip and Report
```yaml
trigger: unfixable_error
actions:
  - Document the error
  - Skip to next error
  - Include in final report
  - Request user assistance
```

## Success Criteria
- [ ] Build completes with exit code 0
- [ ] All unit tests pass
- [ ] No compilation errors
- [ ] Bundle is Active in AEM
- [ ] Package installed successfully
- [ ] No regression introduced
