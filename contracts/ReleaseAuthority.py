# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""Finality-gated release authorization consumer for PATHCLOCK."""

import hashlib
import json
import datetime
from genlayer import *


def _canonical_json(data: dict) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"))


def _digest(data: dict) -> str:
    return hashlib.sha256(_canonical_json(data).encode("utf-8")).hexdigest()


class ReleaseAuthority(gl.Contract):
    admin: str
    review_engine: str
    configured: bool
    authorizations: TreeMap[str, str]
    authorization_ids_json: str
    authorization_count: u256

    def __init__(self):
        self.admin = str(gl.message.sender_address)
        self.review_engine = ""
        self.configured = False
        self.authorizations = TreeMap()
        self.authorization_ids_json = "[]"
        self.authorization_count = u256(0)

    @gl.public.write
    def configure_review_engine(self, review_engine: str) -> None:
        if str(gl.message.sender_address) != self.admin:
            raise gl.vm.UserError("only admin may configure")
        if self.configured:
            raise gl.vm.UserError("review engine already configured")
        try:
            # Current Studionet decodes address calldata as an Address object;
            # re-wrapping that object with Address(...) raises a type error.
            self.review_engine = str(review_engine)
            Address(self.review_engine)
        except Exception:
            raise gl.vm.UserError("invalid review engine address")
        self.configured = True

    @gl.public.write
    def authorize(
        self,
        review_key: str,
        spec_id: str,
        candidate_version: str,
        candidate_commit: str,
        evidence_digest: str,
        release_owner: str,
    ) -> str:
        if not self.configured:
            raise gl.vm.UserError("review engine not configured")
        if str(gl.message.sender_address) != self.review_engine:
            raise gl.vm.UserError("only configured review engine may authorize")
        if review_key in self.authorizations:
            raise gl.vm.UserError("authorization already exists")
        if len(review_key) < 4 or len(review_key) > 96:
            raise gl.vm.UserError("invalid review key")
        if len(evidence_digest) != 64:
            raise gl.vm.UserError("invalid evidence digest")
        try:
            owner = str(Address(release_owner))
        except Exception:
            raise gl.vm.UserError("invalid release owner")

        receipt = {
            "review_key": review_key,
            "spec_id": spec_id,
            "candidate_version": candidate_version,
            "candidate_commit": candidate_commit,
            "evidence_digest": evidence_digest,
            "release_owner": owner,
            "authorized_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "consumed": False,
            "consumed_at": "",
        }
        receipt["receipt_key"] = _digest(receipt)
        self.authorizations[review_key] = _canonical_json(receipt)
        ids = json.loads(self.authorization_ids_json)
        ids.append(review_key)
        self.authorization_ids_json = json.dumps(ids, separators=(",", ":"))
        self.authorization_count = u256(int(self.authorization_count) + 1)
        return receipt["receipt_key"]

    @gl.public.write
    def consume_authorization(self, review_key: str) -> None:
        raw = self.authorizations.get(review_key, "")
        if not raw:
            raise gl.vm.UserError("authorization not found")
        record = json.loads(raw)
        if record["consumed"]:
            raise gl.vm.UserError("authorization already consumed")
        if str(gl.message.sender_address) != record["release_owner"]:
            raise gl.vm.UserError("only release owner may consume")
        record["consumed"] = True
        record["consumed_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.authorizations[review_key] = _canonical_json(record)

    @gl.public.view
    def get_authorization_for_review(self, review_key: str) -> str:
        return self.authorizations.get(review_key, "")

    @gl.public.view
    def list_authorizations(self, offset: int = 0, limit: int = 30) -> str:
        ids = json.loads(self.authorization_ids_json)
        start = max(0, int(offset))
        size = max(0, min(int(limit), 50))
        selected = ids[start : start + size]
        return _canonical_json({
            "items": [json.loads(self.authorizations[rid]) for rid in selected],
            "total": len(ids),
            "offset": start,
            "limit": size,
        })

    @gl.public.view
    def get_config(self) -> str:
        return _canonical_json({
            "admin": self.admin,
            "review_engine": self.review_engine,
            "configured": self.configured,
            "authorizations": int(self.authorization_count),
        })
