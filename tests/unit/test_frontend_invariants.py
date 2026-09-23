from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
WEB=ROOT/'web'

def all_text():
    return '\n'.join(p.read_text(encoding='utf-8', errors='ignore') for p in WEB.rglob('*') if p.is_file() and p.suffix in {'.ts','.tsx','.css','.md'})

def test_exact_public_page_route_set():
    routes=[]
    for p in (WEB/'app').rglob('page.tsx'):
        rel=p.relative_to(WEB/'app').parent.as_posix()
        routes.append('/' if rel=='.' else '/'+rel)
    assert sorted(routes)==sorted(['/', '/console', '/release/[reviewKey]', '/proof/[receiptKey]'])

def test_prohibited_route_folders_absent():
    prohibited={'dashboard','account','protocol','new','evidence','consensus','finality','reviews','releases','settings'}
    assert not any((WEB/'app'/x).exists() for x in prohibited)

def test_no_old_frontend_component_names():
    names={p.name for p in WEB.rglob('*') if p.is_file()}
    assert 'Header.tsx' not in names
    assert 'Footer.tsx' not in names
    assert 'WalletButton.tsx' not in names
    assert 'TxNotice.tsx' not in names

def test_accepted_is_called_provisional():
    text=all_text().lower()
    assert 'accepted · provisional' in text or 'accepted_provisional' in text
    assert 'not final' in text

def test_network_is_studionet_61999():
    text=all_text()
    assert '61999' in text
    assert 'https://studio.genlayer.com/api' in text

def test_public_proof_is_wallet_independent():
    proof=(WEB/'screens/public-proof/PublicProofScreen.tsx').read_text(encoding='utf-8')
    assert 'useWalletSession' not in proof
    assert 'findProof' in proof

def test_ui_does_not_directly_use_write_contract_outside_chain_adapter():
    offenders=[]
    for p in WEB.rglob('*.tsx'):
        if 'writeContract' in p.read_text(encoding='utf-8'): offenders.append(str(p))
    assert offenders==[]

def test_release_authority_is_used_as_completion_signal():
    room=(WEB/'screens/review-room/ReviewRoomScreen.tsx').read_text(encoding='utf-8')
    assert 'authorization' in room
    assert 'No release authority yet' in room

def test_compose_form_has_no_fake_live_fixture_defaults():
    compose=(WEB/'features/compose-review/ComposeReview.tsx').read_text(encoding='utf-8')
    assert 'example.com' not in compose
    assert 'FILL_WITH_CANDIDATE_COMMIT' not in compose
