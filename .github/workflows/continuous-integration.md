
# This GitHub Actions workflow file sets up a continuous integration pipeline for a .NET project with Node.js linting. add this file once the old errors are solved
name: .NET Build and Test
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

env:
  DOTNET_VERSION: '8.0.x'
  NODE_VERSION: '18'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout code
      - name: Checkout code
        uses: actions/checkout@v4
  
      # 2. Cache node modules for better performance
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      # 3. Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      # 4. Install dependencies
      - name: Install dependencies
        run: npm ci

      # 5. Run ESLint
      - name: Run ESLint
        run: npm run lint

  build-and-test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout code
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Setup .NET
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      # 3. Cache NuGet packages
      - name: Cache NuGet packages
        uses: actions/cache@v3
        with:
          path: ~/.nuget/packages
          key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj', '**/*.fsproj', '**/*.vbproj') }}
          restore-keys: |
            ${{ runner.os }}-nuget-

      # 4. Restore dependencies
      - name: Restore dependencies
        run: dotnet restore

      # 5. Build the project
      - name: Build
        run: dotnet build --no-restore --configuration Release

      # 6. Run tests
      # - name: Run tests
      #   run: dotnet test --no-build --configuration Release --verbosity normal

      # 7. Upload test results (optional)
      # - name: Upload test results
      #   uses: actions/upload-artifact@v3
      #   if: always()
      #   with:
      #     name: test-results
      #     path: |
      #       **/TestResults/*.xml
      #       **/TestResults/*.trx