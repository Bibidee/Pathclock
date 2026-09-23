# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""PATHCLOCK immutable remediation specification registry."""

import hashlib
import json
import datetime
import re
from genlayer import *


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise gl.vm.UserError(message)


def _bounded(value: str, field: str, minimum: int, maximum: int) -> str:
    clean = value.strip()
    _require(len(clean) >= minimum, f"{field} too short")
    _require(len(clean) <= maximum, f"{field} too long")
    return clean


def _https_url(value: str, field: str, origin_only: bool = False) -> str:
    clean = _bounded(value, field, 12, 800)
    _require(clean == clean.strip() and "\\" not in clean, f"{field} URL malformed")
    _require(all(ord(char) > 32 and ord(char) != 127 for char in clean), f"{field} URL contains control/space characters")
    match = re.match(r"^https://([^/?#]+)(/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$", clean, re.IGNORECASE)
    _require(match is not None, f"{field} must be a valid https URL")
    authority = match.group(1)
    _require("@" not in authority, f"{field} credentials not allowed")
    _require(":" not in authority, f"{field} custom ports not allowed")
    host = authority.lower()
    _require(not host.endswith("."), f"{field} trailing-dot host not allowed")
    _require(len(host) <= 253 and "." in host, f"{field} public hostname required")
    _require(not host.startswith("[") and ":" not in host, f"{field} IPv6 host not allowed")
    is_ipv4 = bool(re.fullmatch(r"[0-9.]+", host))
    if is_ipv4:
        parts = host.split(".")
        _require(len(parts) == 4 and all(part.isdigit() and 0 <= int(part) <= 255 for part in parts), f"{field} malformed IP address")
        first = int(parts[0])
        second = int(parts[1])
        _require(first not in (0, 10, 127) and first < 224 and not (first == 100 and 64 <= second <= 127) and not (first == 169 and second == 254) and not (first == 172 and 16 <= second <= 31) and not (first == 192 and (second == 0 or second == 168 or second == 88)) and not (first == 198 and second in (18, 19, 51)) and not (first == 203 and second == 0 and parts[2] == "113"), f"{field} non-public host not allowed")
    else:
        labels = host.split(".")
        _require(all(re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label) for label in labels), f"{field} malformed hostname")
        _require(all(label not in ("localhost", "local", "internal", "test", "invalid") for label in labels), f"{field} non-public host not allowed")
    path = match.group(2) or ""
    if origin_only:
        _require(path == "", f"{field} must be an https origin without path")
        _require("?" not in clean and "#" not in clean, f"{field} must not contain query or fragment")
    return "https://" + host + clean[len("https://" + authority):]


_REQUIRED_EVIDENCE = ("advisory", "patch", "tests", "deployment")


def _validated_policy(policy: dict) -> dict:
    _require(set(policy.keys()) == {"required", "version"}, "evidence policy fields invalid")
    _require(policy.get("version") == 1, "unsupported evidence policy version")
    required = policy.get("required")
    _require(isinstance(required, list), "evidence policy required must be an array")
    _require(all(isinstance(item, str) for item in required), "evidence policy categories must be strings")
    _require(len(required) == len(_REQUIRED_EVIDENCE), "evidence policy must require all supported categories")
    _require(set(required) == set(_REQUIRED_EVIDENCE), "evidence policy contains unsupported or missing categories")
    return {"required": list(_REQUIRED_EVIDENCE), "version": 1}


def _canonical_json(data: dict) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"))


def _digest(data: dict) -> str:
    return hashlib.sha256(_canonical_json(data).encode("utf-8")).hexdigest()


class RemediationRegistry(gl.Contract):
    specs: TreeMap[str, str]
    spec_ids_json: str
    spec_count: u256

    def __init__(self):
        self.specs = TreeMap()
        self.spec_ids_json = "[]"
        self.spec_count = u256(0)

    @gl.public.write
    def freeze_spec(
        self,
        spec_id: str,
        repository_url: str,
        advisory_url: str,
        security_requirement: str,
        baseline_ref: str,
        evidence_policy_json: str,
        allowed_origins_json: str,
    ) -> str:
        sid = _bounded(spec_id, "spec_id", 4, 96)
        _require(sid not in self.specs, "spec already exists")
        repo = _https_url(repository_url, "repository_url")
        advisory = _https_url(advisory_url, "advisory_url")
        requirement = _bounded(security_requirement, "security_requirement", 24, 4000)
        baseline = _bounded(baseline_ref, "baseline_ref", 1, 160)

        try:
            # SDK clients may preserve these ABI values as JSON strings, while
            # the CLI conveniently decodes JSON-looking arguments first.
            policy = evidence_policy_json if isinstance(evidence_policy_json, dict) else json.loads(evidence_policy_json)
            origins = allowed_origins_json if isinstance(allowed_origins_json, list) else json.loads(allowed_origins_json)
        except Exception:
            raise gl.vm.UserError("policy/origins must be valid JSON")

        _require(isinstance(policy, dict), "evidence policy must be an object")
        policy = _validated_policy(policy)
        _require(isinstance(origins, list), "allowed origins must be an array")
        _require(1 <= len(origins) <= 8, "allowed origins must contain 1-8 entries")

        normalized_origins = []
        for origin in origins:
            _require(isinstance(origin, str), "origin must be a string")
            o = _https_url(origin, "allowed_origin", origin_only=True)
            if o not in normalized_origins:
                normalized_origins.append(o)
        _require(len(normalized_origins) == len(origins), "duplicate allowed origin")

        record = {
            "spec_id": sid,
            "owner": str(gl.message.sender_address),
            "repository_url": repo,
            "advisory_url": advisory,
            "security_requirement": requirement,
            "baseline_ref": baseline,
            "evidence_policy": policy,
            "allowed_origins": normalized_origins,
            "frozen_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        record["spec_digest"] = _digest(record)

        self.specs[sid] = _canonical_json(record)
        ids = json.loads(self.spec_ids_json)
        ids.append(sid)
        self.spec_ids_json = json.dumps(ids, separators=(",", ":"))
        self.spec_count = u256(int(self.spec_count) + 1)
        return record["spec_digest"]

    @gl.public.view
    def get_spec(self, spec_id: str) -> str:
        return self.specs.get(spec_id, "")

    @gl.public.view
    def list_specs(self, offset: int = 0, limit: int = 30) -> str:
        ids = json.loads(self.spec_ids_json)
        start = max(0, int(offset))
        size = max(0, min(int(limit), 50))
        selected = ids[start : start + size]
        return _canonical_json({
            "items": [json.loads(self.specs[sid]) for sid in selected],
            "total": len(ids),
            "offset": start,
            "limit": size,
        })

    @gl.public.view
    def get_stats(self) -> str:
        return _canonical_json({"specs": int(self.spec_count)})
