# Getting Money Skills onto TestFlight

1. `cd money-skills-native && npx eas-cli login` then `npx eas-cli init` (creates the EAS project, writes `extra.eas.projectId` + `owner` into app.json).
2. `npx eas-cli credentials -p ios` and sign in with your Apple ID when it asks (creates certs/profile for `com.solyapps.moneyskills`). Do this yourself; nobody else should type Apple credentials.
3. Create the repo, push, add the EXPO_TOKEN secret (see tests/set-expo-token.ps1 pattern from the other apps).
4. First build with submit off: `gh workflow run ios-testflight.yml -R theprojectmaker/money-skills-ios -f submit=false`, download the .ipa artifact.
5. `npx eas-cli submit -p ios --path <app.ipa>` once, interactively: it creates the App Store Connect app. Put the printed ascAppId into `eas.json` -> `submit.production.ios.ascAppId`, commit, push.
6. From then on: `gh workflow run ios-testflight.yml -R theprojectmaker/money-skills-ios -f submit=true`.
