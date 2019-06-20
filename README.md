# Dr. Squatch

Dr. Squatch provides organic and natural handmade soap to men who want to feel like a man, and smell like a champion.

## What's in this Repo

This repository houses the main code base for the <https://drsquatch.com> website.

At a high level, the workflow for editing and pushing code involves making changes in your personal branch and then merging them into master. The production branch represents the live codebase and is separate from master.

* Link to preview master: <willgohere.com>
## Contributing

First, clone this repo so you're up to date:

First of all, you're gonna need to **clone** the current **master** branch:

```
git clone 'https://github.com/dr-squatch/drsquatch'
```

Then, you need to create your personal branch.

**IMPORTANT:** The name of your personal branch must match the name of the folder holding your design in the FTP server!

Example:

```bash
git checkout -b joybox_men-copy-40_2153636200
```

## Development Workflow

Once you have your personal branch setup correctly, you can making changes and creating commits:
Example:
```bash
git commit -a -m "Make Title's font size bigger"
```

Then, push your commit(s) to Github:
```
git push origin joybox_men-copy-40_2153636200
```

This will automatically trigger a Codeship "build" and deploy your changes to the FTP server. Codeship's deploy script uses
`git diff --name-only HEAD $BASE_SHA` to figure out what files changed and avoid to reupload hundreds of files at once.

You can now preview your changes online by visiting your personal **Unpublished Design** in your `my.cratejoy.com` dashboard.

Finally, you need to create a **Pull Request** using the Github Interface in order for everyone to see your specific changes.
Once your changes are reviewed and approved, they will then get merged into the **master** branch. This will trigger another
Codeship deploy script, this time pointing to the **Published Design**.

**NOTE:** Any conflict between different versions of the same file will show up in this step, and the Github Pull Request interface
will allow us to solve these conflicts in an ordered manner, without overwritting another developer's work.


