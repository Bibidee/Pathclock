import json
import pytest

pytestmark = pytest.mark.direct

def test_freeze_and_read_spec(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    digest = c.freeze_spec(
        "spec-auth-expiry",
        "https://example.com/repo",
        "https://example.com/advisory",
        "Expired sessions must be rejected before privileged account data is returned.",
        "v4.2.6",
        json.dumps({"required": ["patch", "tests", "deployment"]}),
        json.dumps(["https://example.com"]),
    )
    assert len(digest) == 64
    spec = json.loads(c.get_spec("spec-auth-expiry"))
    assert spec["baseline_ref"] == "v4.2.6"
    assert spec["owner"]


def test_duplicate_spec_reverts(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    args = (
        "spec-dup", "https://example.com/repo", "https://example.com/advisory",
        "A sufficiently long frozen security requirement for a duplicate test.", "abc1234",
        json.dumps({}), json.dumps(["https://example.com"]),
    )
    c.freeze_spec(*args)
    with direct_vm.expect_revert("spec already exists"):
        c.freeze_spec(*args)


def test_private_origin_rejected(direct_vm, direct_deploy, direct_alice):
    c = direct_deploy("contracts/RemediationRegistry.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("private host"):
        c.freeze_spec(
            "spec-private", "https://example.com/repo", "https://example.com/advisory",
            "A sufficiently long frozen security requirement for URL validation.", "abc1234",
            json.dumps({}), json.dumps(["https://192.168.1.2"]),
        )
