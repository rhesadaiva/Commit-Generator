# Git Commit Message Generator

An intelligent Git commit message generator powered by AI. This tool helps you craft meaningful commit messages by analyzing your staged changes and generating suggestions in multiple languages.

## Features
- **AI-Powered Commit Messages**: Automatically generates commit messages and descriptions based on your changes.
- **Multi-Language Support**: Supports English and Bahasa Indonesia (more languages can be added).
- **Interactive Workflow**: Guides you through selecting commit types and languages.
- **Editor Integration**: Allows editing the generated message in your preferred editor before committing.

## Installation

### Prerequisites
- [Deno](https://deno.land/) (v1.30.0 or later) installed on your system.

### Install the Tool
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/git-commit-msg-generator.git
   cd git-commit-msg-generator
   ```

2. Run the tool directly with Deno:
   ```bash
   deno run --allow-run --allow-read --allow-write --allow-env --allow-net src/main.ts
   ```

## Compile to Binary
You can compile the tool into a standalone binary for Windows, Linux, or macOS.

### Compile for All Platforms
Run the following command to compile the binary:
```bash
deno compile --allow-run --allow-read --allow-write --allow-env --allow-net -o git-commit-msg src/main.ts
```

### Platform-Specific Notes
- **Windows**: The binary will be named `git-commit-msg.exe`.
- **Linux/macOS**: The binary will be named `git-commit-msg`.

### Install the Binary Globally
To make the tool available system-wide:
```bash
deno compile --allow-run --allow-read --allow-write --allow-env --allow-net -o ~/.local/bin/git-commit-msg src/main.ts
```
Ensure `~/.local/bin` is in your `PATH`.

## Usage

### Basic Usage
1. Stage your changes:
   ```bash
   git add .
   ```

2. Run the tool:
   ```bash
   git-commit-msg
   ```

3. Follow the prompts:
   - Select a commit type (e.g., `feat`, `fix`, `docs`).
   - Choose a language for the commit message (English or Bahasa Indonesia).
   :

   - Review the generated message and description.
   - Choose to:
     - **Use as is**: Commit with the generated message.
     - **Edit**: Open the message in your editor for modifications.
     - **Cancel**: Exit without committing.

### Command-Line Options
- `--help` or `-h`: Show the help message.
- `--version` or `-v`: Show the version information.

## Testing
To run the unit tests:
```bash
deno test --allow-run --allow-read --allow-write --allow-env --allow-net --no-check src/main.test.ts
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
[MIT](LICENSE)

