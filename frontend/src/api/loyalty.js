import { http } from './http'

function isUsableNumber(val) {
  return val != null && val !== '' && !isNaN(val)
}

function buildFilterParams(filter) {
  if (!filter) return {}
  const params = {}
  if (filter.tier_id != null && filter.tier_id !== '' && !isNaN(filter.tier_id)) {
    params.tier_id = filter.tier_id
  }
  if (isUsableNumber(filter.points_min)) {
    params.points_min = Number(filter.points_min)
  }
  if (isUsableNumber(filter.points_max)) {
    params.points_max = Number(filter.points_max)
  }
  if (filter.birthday_month != null && filter.birthday_month !== '' && !isNaN(filter.birthday_month)) {
    params.birthday_month = filter.birthday_month
  }
  if (filter.phone != null && filter.phone !== '') {
    params.phone = filter.phone
  }
  return params
}

export const loyaltyApi = {
  dashboard: (filter) => http.get('/members/dashboard', { params: buildFilterParams(filter) }),
  members: (filter) => http.get('/members', { params: buildFilterParams(filter) }),
  createMember: (payload) => http.post('/members', payload),
  rules: () => http.get('/points/rules'),
  earnPoints: (payload) => http.post('/points/earn', payload),
  transactions: () => http.get('/points/transactions'),
  gifts: () => http.get('/gifts'),
  redeemGift: (payload) => http.post('/gifts/redeem', payload),
  tiers: () => http.get('/tiers'),
  vouchers: () => http.get('/vouchers'),
  issueBirthdayVouchers: () => http.post('/vouchers/birthday/issue', {})
}
