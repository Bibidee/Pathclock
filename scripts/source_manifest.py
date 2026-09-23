from __future__ import annotations
import hashlib, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
paths = [ROOT/'contracts'/'RemediationRegistry.py', ROOT/'contracts'/'PatchReviewEngine.py', ROOT/'contracts'/'ReleaseAuthority.py']
out = {}
for p in paths:
    data = p.read_bytes()
    out[str(p.relative_to(ROOT))] = {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
print(json.dumps(out, indent=2, sort_keys=True))
