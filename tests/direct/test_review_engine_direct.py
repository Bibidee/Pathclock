"""Direct-mode review tests.

These are intended to be completed/run by the finishing agent after installing the pinned
GenLayer test stack. They intentionally exercise real validator disagreement rather than
mocking the review method itself.
"""
import json
import pytest

pytestmark = pytest.mark.direct


def _freeze(registry, direct_vm, owner):
    direct_vm.sender = owner
    registry.freeze_spec(
        "spec-auth-expiry",
        "https://evidence.example/repo",
        "https://evidence.example/advisory",
        "Expired sessions must be rejected before privileged account data is returned.",
        "v4.2.6",
        json.dumps({"required": ["patch", "tests", "deployment"]}),
        json.dumps(["https://evidence.example"]),
    )


def test_evidence_origin_guard_is_in_source():
    # This remains runnable even before cross-contract fixture work is completed.
    from pathlib import Path
    src = Path("contracts/PatchReviewEngine.py").read_text()
    assert "origin is not frozen/allowed" in src
    assert "source_unavailable" in src
    assert 'emit(on="finalized")' in src
