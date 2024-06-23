# Contributing guide

Thank you for your interest in contributing to factory-js.  
The goal of this library is to enable developers to save time and write tests more easily and readably.  
Contributions are essential to achieving this goal, and we welcome contributions from everyone!

## Where to contribute

### Fixing bugs

We would appreciate it if you could report any bugs using [Issues](https://github.com/factory-js/factory-js/issues/new/choose).  
If you believe you can fix the bug you found, we welcome you to submit a PR directly, no issue report required!  
Also, we would appreciate it if you could consider adding tests to prevent the bug from happening again.

### Documentation

Improvements to the documentation are always welcome.  
If you find a typo or believe our documentation can be improved, we would appreciate it if you could submit a PR.

### Refactoring

If you believe you can make our code cleaner and more readable, please submit a PR to us.  
When refactoring code, please also consider adding new tests as needed to avoid introducing new bugs.

### Features

Adding new feature tend to be subjective and need some consideration.  
If you'd like to propose a new feature, please let us know via an issue before submitting a PR!

## How to contribute

1. Fork this repository from [GitHub link](https://github.com/factory-js/factory-js/fork) and clone it. [First Contributions](https://github.com/firstcontributions/first-contributions) would be helpful.

   ```sh
   git clone git@github.com:<your-username>/factory-js.git
   cd factory-js
   ```

1. Install the pnpm with [Corepack](https://nodejs.org/api/corepack.html). Run the following in the project root:

   ```sh
   corepack enable pnpm
   ```

1. Install packages.

   ```sh
   pnpm install
   ```

1. Create a branch and checkout.

   ```sh
   git switch -c your-new-branch-name
   ```

1. Copy `.env.sample` to `.env`.

   ```sh
   cp packages/prisma-factory/e2e/.env.sample packages/prisma-factory/e2e/.env
   ```

1. Start databases for running tests with [docker-compose](https://docs.docker.com/compose/).

   ```sh
   docker-compose up
   ```

1. Code and commit your changes.

   ```sh
   git commit -m 'add a new feature'
   ```

1. Run linters and tests in the project root before pushing the PR.

   ```sh
   pnpm run secretlint
   pnpm run type-check
   pnpm run lint
   pnpm run test
   pnpm run format
   ```

1. Push your changes and open the PR.

   ```sh
   git push -u origin your-branch-name
   ```

1. Add a new changeset as needed, since we use [Changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) to generate release notes.

   ```sh
   pnpm exec changeset
   ```

   When you bump the version, please refer to the following guide.

   - `major`: This should never be used because factory-js is still < 1.0.0.
   - `minor`: Adding new features regardless of whether they introduce breaking changes.
   - `patch`: Fixing a bug and/or refactoring.
   - If the changes don't require a new release, such as documentation improvements, you can skip this step.

1. Rename your PR title to comply with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), CI will automatically verify this.  
   You don't need to change commit messages because we use squash merge.

1. Please ensure all CI checks have passed. That's all! 🎉
