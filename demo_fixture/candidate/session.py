def privileged_account_state(session, store):
    # Candidate: reject first, then perform the privileged read.
    if session.expired:
        raise PermissionError("expired session")
    return store.read_privileged(session.user_id)
