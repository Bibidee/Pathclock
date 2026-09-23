import json
import pytest

pytestmark = pytest.mark.direct

def test_freeze_and_read_spec(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    digest = c.freeze_spec(
        "spec-auth-expiry",
        "https://example.org/repo",
        "https://example.org/advisory",
        "Expired sessions must be rejected before privileged account data is returned.",
        "v4.2.6",
        json.dumps({"required": ["advisory", "patch", "tests", "deployment"], "version": 1}),
        json.dumps(["https://example.org"]),
    )
    assert len(digest) == 64
    spec = json.loads(c.get_spec("spec-auth-expiry"))
    assert spec["baseline_ref"] == "v4.2.6"
    assert spec["owner"]


def test_duplicate_spec_reverts(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    args = (
        "spec-dup", "https://example.org/repo", "https://example.org/advisory",
        "A sufficiently long frozen security requirement for a duplicate test.", "abc1234",
        json.dumps({"required": ["advisory", "patch", "tests", "deployment"], "version": 1}), json.dumps(["https://evidence.example"]),
    )
    c.freeze_spec(*args)
    with direct_vm.expect_revert("spec already exists"):
        c.freeze_spec(*args)


def test_private_origin_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("non-public host"):
        c.freeze_spec(
            "spec-private", "https://evidence.example/repo", "https://evidence.example/advisory",
            "A sufficiently long frozen security requirement for URL validation.", "abc1234",
            json.dumps({"required": ["advisory", "patch", "tests", "deployment"], "version": 1}), json.dumps(["https://192.168.1.2"]),
        )


@pytest.mark.parametrize("policy", [
    {},
    {"required": ["patch", "tests", "deployment"], "version": 1},
    {"required": ["advisory", "patch", "tests", "deployment", "extra"], "version": 1},
    {"required": ["advisory", "patch", "tests", "deployment"], "version": 2},
])
def test_unsupported_or_incomplete_evidence_policy_rejected(direct_vm, direct_deploy, direct_alice, policy):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("evidence policy"):
        c.freeze_spec(
            "spec-policy", "https://evidence.example/repo", "https://evidence.example/advisory",
            "A sufficiently long frozen security requirement for policy validation.", "abc1234",
            json.dumps(policy), json.dumps(["https://evidence.example"]),
        )


@pytest.mark.parametrize("origin", [
    "https://user@evidence.example", "https://evidence.example:8443", "https://localhost",
    "https://service.internal", "https://127.0.0.1", "https://10.1.2.3", "https://172.16.1.4",
    "https://192.168.1.2", "https://169.254.1.2", "https://100.64.0.1", "https://192.0.2.12",
    "https://198.51.100.12", "https://203.0.113.12", "https://[::1]", "https://example.com.",
    "https://evidence.example/path", "https://evidence.example?query=1", "https://bad_host.example",
])
def test_noncanonical_or_nonpublic_allowed_origin_rejected(direct_vm, direct_deploy, direct_alice, origin):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert():
        c.freeze_spec(
            "spec-origin", "https://evidence.example/repo", "https://evidence.example/advisory",
            "A sufficiently long frozen security requirement for origin validation.", "abc1234",
            json.dumps({"required": ["advisory", "patch", "tests", "deployment"], "version": 1}), json.dumps([origin]),
        )


def test_duplicate_canonical_origins_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("duplicate allowed origin"):
        c.freeze_spec(
            "spec-duplicate-origins", "https://evidence.example/repo", "https://evidence.example/advisory",
            "A sufficiently long frozen security requirement for duplicate origins.", "abc1234",
            json.dumps({"required": ["advisory", "patch", "tests", "deployment"], "version": 1}),
            json.dumps(["https://evidence.example", "https://EVIDENCE.example"]),
        )
