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
    c.configure_review_engine(to_hex(direct_bob))
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
