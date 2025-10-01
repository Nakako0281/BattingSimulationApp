-- ============================================
-- Test Data for Baseball Batting Simulator
-- ============================================
-- Creates test teams and players for 'testuser'
-- All players have identical stats with OPS ~0.700

-- ============================================
-- OPS Calculation Target: 0.700
-- ============================================
-- OPS = OBP + SLG
-- Target: OBP ~0.330, SLG ~0.370
--
-- Stats breakdown:
-- - 打数: 400
-- - 単打: 70
-- - 二塁打: 20
-- - 三塁打: 3
-- - 本塁打: 7
-- - 四球: 40
-- - その他のアウト: 260
--
-- 計算:
-- 安打数 = 70 + 20 + 3 + 7 = 100
-- 塁打数 = 70×1 + 20×2 + 3×3 + 7×4 = 70 + 40 + 9 + 28 = 147
-- 打率 = 100 / 400 = .250
-- OBP = (100 + 40) / (400 + 40) = 140 / 440 = .318
-- SLG = 147 / 400 = .368
-- OPS = .318 + .368 = .686 ≈ 0.700
-- ============================================

-- First, get the testuser's ID
DO $$
DECLARE
  test_user_id UUID;
  team_a_id UUID;
  team_b_id UUID;
BEGIN
  -- Get testuser's ID
  SELECT id INTO test_user_id FROM users WHERE nickname = 'testuser';

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'testuser not found. Please create testuser first.';
  END IF;

  -- Create Team A
  INSERT INTO teams (id, user_id, name, created_at)
  VALUES (
    gen_random_uuid(),
    test_user_id,
    'テストチームA',
    NOW()
  )
  RETURNING id INTO team_a_id;

  -- Create Team B
  INSERT INTO teams (id, user_id, name, created_at)
  VALUES (
    gen_random_uuid(),
    test_user_id,
    'テストチームB',
    NOW()
  )
  RETURNING id INTO team_b_id;

  -- Insert 9 players for Team A (all with identical stats)
  INSERT INTO players (team_id, name, batting_order, singles, doubles, triples, home_runs, walks, strikeouts, groundouts, flyouts, at_bats, created_at)
  VALUES
    (team_a_id, '選手1', 1, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手2', 2, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手3', 3, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手4', 4, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手5', 5, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手6', 6, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手7', 7, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手8', 8, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_a_id, '選手9', 9, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW());

  -- Insert 9 players for Team B (all with identical stats)
  INSERT INTO players (team_id, name, batting_order, singles, doubles, triples, home_runs, walks, strikeouts, groundouts, flyouts, at_bats, created_at)
  VALUES
    (team_b_id, '選手1', 1, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手2', 2, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手3', 3, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手4', 4, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手5', 5, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手6', 6, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手7', 7, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手8', 8, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW()),
    (team_b_id, '選手9', 9, 70, 20, 3, 7, 40, 80, 90, 90, 400, NOW());

  RAISE NOTICE 'Test data created successfully!';
  RAISE NOTICE 'Team A ID: %', team_a_id;
  RAISE NOTICE 'Team B ID: %', team_b_id;
  RAISE NOTICE 'Created 18 players (9 per team) with OPS ≈ 0.700';
END $$;

-- ============================================
-- Verification Query
-- ============================================
-- Uncomment to verify the data:
/*
SELECT
  t.name AS team_name,
  p.name AS player_name,
  p.batting_order,
  p.at_bats,
  p.singles + p.doubles + p.triples + p.home_runs AS hits,
  ROUND((p.singles + p.doubles + p.triples + p.home_runs)::numeric / NULLIF(p.at_bats, 0), 3) AS avg,
  ROUND((p.singles + p.doubles + p.triples + p.home_runs + p.walks)::numeric / NULLIF(p.at_bats + p.walks, 0), 3) AS obp,
  ROUND((p.singles + p.doubles * 2 + p.triples * 3 + p.home_runs * 4)::numeric / NULLIF(p.at_bats, 0), 3) AS slg,
  ROUND(
    (p.singles + p.doubles + p.triples + p.home_runs + p.walks)::numeric / NULLIF(p.at_bats + p.walks, 0) +
    (p.singles + p.doubles * 2 + p.triples * 3 + p.home_runs * 4)::numeric / NULLIF(p.at_bats, 0),
    3
  ) AS ops
FROM players p
JOIN teams t ON p.team_id = t.id
JOIN users u ON t.user_id = u.id
WHERE u.nickname = 'testuser'
ORDER BY t.name, p.batting_order;
*/
