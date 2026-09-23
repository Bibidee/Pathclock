from __future__ import annotations
import argparse, json

p=argparse.ArgumentParser(description="Generate immutable raw GitHub evidence URLs for the PATHCLOCK demo fixture")
p.add_argument("--owner", required=True)
p.add_argument("--repo", required=True)
p.add_argument("--commit", required=True)
a=p.parse_args()
base=f"https://raw.githubusercontent.com/{a.owner}/{a.repo}/{a.commit}"
print(json.dumps({
  "repository_url": f"https://github.com/{a.owner}/{a.repo}",
  "advisory_url": f"{base}/demo_fixture/evidence/advisory.md",
  "patch_url": f"{base}/demo_fixture/evidence/patch.md",
  "tests_url": f"{base}/demo_fixture/evidence/tests.md",
  "deployment_url": f"{base}/demo_fixture/evidence/deployment.md",
  "allowed_origins": ["https://github.com", "https://raw.githubusercontent.com"],
}, indent=2))
