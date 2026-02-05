-- Supabase Schema Setup for Vehicle Dependency System

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "addedDate" DATE DEFAULT CURRENT_DATE
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT PRIMARY KEY,
    data JSONB NOT NULL
);

-- Initial Settings
INSERT INTO settings (id, data)
VALUES (1, '{"departmentName":"وزارة النقل والمواصلات","sectionName":"قسم شؤون المركبات","branchName":"شعبة إلغاء الاعتمادية","defaultSettlementDays":15,"primaryColor":"#1e40af","uiStyle":"modern","fontSize":"medium","darkMode":false,"users":[],"notifications":{"enableBrowser":true,"notifyBeforeDays":3,"notifyOnOverdue":true},"appearance":{"sidebarStyle":"full","borderRadius":"large"}}')
ON CONFLICT (id) DO NOTHING;

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    "applicantName" TEXT NOT NULL,
    "requestDate" DATE NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "ownership" TEXT,
    "company" TEXT,
    "correspondence" JSONB NOT NULL DEFAULT '{"status": "قيد الإجراء"}',
    "financialSettlement" JSONB NOT NULL DEFAULT '{"status": "قيد الإجراء"}',
    "cancellation" JSONB NOT NULL DEFAULT '{"status": "قيد الإجراء"}',
    "notes" TEXT,
    "settlementDays" INTEGER DEFAULT 15,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for authenticated users" ON companies FOR ALL TO authenticated USING (true);
CREATE POLICY "Full access for authenticated users" ON settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Full access for authenticated users" ON requests FOR ALL TO authenticated USING (true);