def privileged_account_state(session, store):
    # Vulnerable baseline: sensitive state is read before expiry rejection.
    result = store.read_privileged(session.user_id)
    if session.expired:
        raise PermissionError("expired session")
    return result
