from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(name: str) -> str:
    return (ROOT / "contracts" / name).read_text()


def test_three_contract_boundaries_exist():
    for name in ("RemediationRegistry.py", "PatchReviewEngine.py", "ReleaseAuthority.py"):
        assert (ROOT / "contracts" / name).exists()


def test_review_engine_has_substantive_custom_validator():
    src = read("PatchReviewEngine.py")
    assert "run_nondet_unsafe" in src
    assert "requirement_satisfied" in src
    assert "candidate_identity_verified" in src
    assert "regression_tests_pass" in src
    assert "patch_evidence_consistent" in src
    assert "deployment_evidence_consistent" in src
    assert "evidence_digest" in src


def test_no_format_only_validation_language():
    src = read("PatchReviewEngine.py")
    assert "Compare the decision-bearing substance" in src
    assert "JSON validity" not in src


def test_finality_gated_authorization():
    src = read("PatchReviewEngine.py")
    assert 'emit(on="finalized").authorize' in src
    assert 'emit(on="accepted").authorize' not in src


def test_explicit_inconclusive_path():
    src = read("PatchReviewEngine.py")
    assert src.count("INCONCLUSIVE") >= 6


def test_prompt_injection_defense_present():
    src = read("PatchReviewEngine.py")
    assert "untrusted data" in src
    assert "prompt injection" in src

def test_validator_compares_conflict_commitment():
    src = read("PatchReviewEngine.py")
    assert '"evidence_conflicts"' in src
    assert '"evidence_digest"' in src
    assert '"source_unavailable"' in src

def test_private_network_guards_cover_rfc1918_ranges():
    registry = read("RemediationRegistry.py")
    engine = read("PatchReviewEngine.py")
    for src in (registry, engine):
        assert 'host.startswith("10.")' in src
        assert 'host.startswith("172.")' in src
        assert 'host.startswith("192.168.")' in src


def test_registry_has_no_spec_mutation_method():
    src = read("RemediationRegistry.py")
    assert "freeze_spec" in src
    assert "update_spec" not in src
    assert "edit_spec" not in src


def test_authority_is_exact_once():
    src = read("ReleaseAuthority.py")
    assert "authorization already exists" in src
    assert "authorization already consumed" in src


def test_studionet_manifest_locked_to_61999():
    manifest = (ROOT / "deployments" / "studionet.json").read_text()
    assert '"chainId": 61999' in manifest
    assert "studio.genlayer.com/api" in manifest
    assert "61997" not in manifest
