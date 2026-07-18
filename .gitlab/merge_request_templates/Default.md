## Outcome and scope

- Canonical outcome owner:
- Exact owned paths:
- Non-goals:

## Validation

- [ ] `node build/build.mjs --check`
- [ ] `python -B evals/pixelhelm/run_tests.py`
- [ ] Focused skill and syntax checks pass.
- [ ] Generated trees were rebuilt, not hand-edited.
- [ ] Untouched-base behavior is documented separately from new regressions.

## Safety and evidence

- [ ] No credential, private path, provider call, network dependency, or external write.
- [ ] No remote, marketplace, publication, installation, activation, or archive action.
- [ ] Exact diff and checksums are frozen for an independent reviewer.
- [ ] Product decisions and remaining gates are explicit.
