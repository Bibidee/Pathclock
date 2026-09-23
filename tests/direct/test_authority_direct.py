import json
import pytest

pytestmark = pytest.mark.direct

def to_hex(addr):
    if hasattr(addr, "as_hex"):
        return addr.as_hex
    if isinstance(addr, bytes):
        return "0x" + addr.hex()
    return str(addr)


def test_admin_configures_once(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    c = direct_deploy("contracts/ReleaseAuthority.py")
    direct_vm.sender = direct_alice
    c.configure_review_engine(to_hex(direct_vm.sender))
    cfg = json.loads(c.get_config())
    assert cfg["configured"] is True
    with direct_vm.expect_revert("review engine already configured"):
        c.configure_review_engine(to_hex(direct_bob))


def test_non_admin_cannot_configure(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    c = direct_deploy("contracts/ReleaseAuthority.py")
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("only admin"):
        c.configure_review_engine(to_hex(direct_bob))


def test_authorization_requires_engine_and_consumes_exactly_once(
    direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie
):
    direct_vm.sender = direct_alice
    c = direct_deploy("contracts/ReleaseAuthority.py")
    c.configure_review_engine(to_hex(direct_bob))

    digest = "a" * 64
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("only configured review engine may authorize"):
        c.authorize("review-auth", "spec-auth", "4.2.7", "abcdef1", digest, to_hex(direct_alice))

    direct_vm.sender = to_hex(direct_bob)
    receipt_key = c.authorize(
        "review-auth", "spec-auth", "4.2.7", "abcdef1", digest, to_hex(direct_alice)
    )
    assert len(receipt_key) == 64

    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("only release owner may consume"):
        c.consume_authorization("review-auth")

    direct_vm.sender = direct_alice
    c.consume_authorization("review-auth")
    record = json.loads(c.get_authorization_for_review("review-auth"))
    assert record["consumed"] is True
    with direct_vm.expect_revert("authorization already consumed"):
        c.consume_authorization("review-auth")


def test_authorization_rejects_invalid_digest(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    c = direct_deploy("contracts/ReleaseAuthority.py")
    c.configure_review_engine(to_hex(direct_bob))
    direct_vm.sender = to_hex(direct_bob)
    with direct_vm.expect_revert("invalid evidence digest"):
        c.authorize("review-auth", "spec-auth", "4.2.7", "abcdef1", "bad", to_hex(direct_alice))
