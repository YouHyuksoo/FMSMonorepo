/**
 * @file apps/web/lib/data/organizations.ts
 * @description 조직(회사) 시드 데이터
 *
 * 초보자 가이드:
 * 1. 이 파일은 조직 관리와 로그인 페이지에서 공유하는 시드 데이터입니다.
 * 2. 실제 운영 환경에서는 API를 통해 데이터를 가져와야 합니다.
 */

import type { Organization } from "@fms/types";

/**
 * 조직(회사) 시드 데이터
 * - 베트남법인, 중국법인, 인도법인, 멕시코법인, 인니법인
 */
export const seedOrganizations: Organization[] = [
  {
    id: "org-vietnam",
    code: "VN-001",
    name: "베트남법인",
    type: "company",
    level: 1,
    sortOrder: 1,
    isActive: true,
    description: "베트남 호치민 소재 법인",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "org-china",
    code: "CN-001",
    name: "중국법인",
    type: "company",
    level: 1,
    sortOrder: 2,
    isActive: true,
    description: "중국 상해 소재 법인",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "org-india",
    code: "IN-001",
    name: "인도법인",
    type: "company",
    level: 1,
    sortOrder: 3,
    isActive: true,
    description: "인도 첸나이 소재 법인",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "org-mexico",
    code: "MX-001",
    name: "멕시코법인",
    type: "company",
    level: 1,
    sortOrder: 4,
    isActive: true,
    description: "멕시코 과달라하라 소재 법인",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    createdBy: "system",
    updatedBy: "system",
  },
  {
    id: "org-indonesia",
    code: "ID-001",
    name: "인니법인",
    type: "company",
    level: 1,
    sortOrder: 5,
    isActive: true,
    description: "인도네시아 자카르타 소재 법인",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    createdBy: "system",
    updatedBy: "system",
  },
];

/**
 * 로그인 드롭다운용 회사 목록
 * - 활성화된 회사만 반환
 */
export const getCompaniesForLogin = () => {
  return seedOrganizations
    .filter((org) => org.type === "company" && org.isActive)
    .map((org) => ({
      id: org.id,
      name: org.name,
    }))
    .sort((a, b) => {
      const orgA = seedOrganizations.find((o) => o.id === a.id);
      const orgB = seedOrganizations.find((o) => o.id === b.id);
      return (orgA?.sortOrder || 0) - (orgB?.sortOrder || 0);
    });
};
