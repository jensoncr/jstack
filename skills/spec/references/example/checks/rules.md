# Rules for RFQ intake

Cases in `cases.yaml` prove behaviour on examples. Rules must hold on every input, so each one is checked by a property test or a guard in the pipeline, not by an example.

| Id | Rule | How it is checked |
| --- | --- | --- |
| RU1 | An extracted value appears in the email body or an attachment name. | For every case and for generated emails, each non-empty field is found in the source text. |
| RU2 | No request from an export-controlled customer leaves the network. | The test run blocks outbound network calls and fails on any attempt. |
| RU3 | A request with an unresolved flag cannot be exported. | Generate requests with random flags; `export` must refuse every one that has an open flag. |

## One command

`make check` runs the cases, then the rules, and prints one line:

```text
cases 4/6  rules 3/3  FAIL
```

That line is the number the builder climbs. The command, the cases and the rules are frozen once you approve them. A change to any of them is its own commit and needs your approval.

## Held-back cases

`checks/holdout/` has four more cases with the same shape. The builder is told not to read the folder, and the reviewer runs them once at the end. In a swarm, the verifier holds them and the builders never receive them.
