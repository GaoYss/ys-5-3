import { reactive } from 'vue'
import { loyaltyApi } from '../api/loyalty'

const filter = reactive({
  tier_id: '',
  points_min: '',
  points_max: '',
  birthday_month: '',
  phone: ''
})

const state = reactive({
  loading: false,
  error: '',
  notice: '',
  dashboard: null,
  members: [],
  rules: [],
  gifts: [],
  tiers: [],
  vouchers: [],
  transactions: [],
  filter
})

async function run(action, successMessage = '') {
  state.loading = true
  state.error = ''
  try {
    const result = await action()
    state.notice = successMessage
    return result
  } catch (error) {
    state.error = error.message
    throw error
  } finally {
    state.loading = false
  }
}

async function refreshMembersWithFilter() {
  state.loading = true
  state.error = ''
  try {
    const [dashboard, members] = await Promise.all([
      loyaltyApi.dashboard(filter),
      loyaltyApi.members(filter)
    ])
    Object.assign(state, { dashboard, members })
  } catch (error) {
    state.error = error.message
  } finally {
    state.loading = false
  }
}

async function refreshAll() {
  state.loading = true
  state.error = ''
  try {
    const [dashboard, members, rules, gifts, tiers, vouchers, transactions] = await Promise.all([
      loyaltyApi.dashboard(filter),
      loyaltyApi.members(filter),
      loyaltyApi.rules(),
      loyaltyApi.gifts(),
      loyaltyApi.tiers(),
      loyaltyApi.vouchers(),
      loyaltyApi.transactions()
    ])
    Object.assign(state, { dashboard, members, rules, gifts, tiers, vouchers, transactions })
  } catch (error) {
    state.error = error.message
  } finally {
    state.loading = false
  }
}

function resetFilter() {
  Object.assign(filter, {
    tier_id: '',
    points_min: '',
    points_max: '',
    birthday_month: '',
    phone: ''
  })
}

export function useLoyaltyData() {
  return {
    state,
    filter,
    refreshAll,
    refreshMembersWithFilter,
    resetFilter,
    async createMember(payload) {
      await run(() => loyaltyApi.createMember(payload), '会员已创建')
      await refreshAll()
    },
    async earnPoints(payload) {
      await run(() => loyaltyApi.earnPoints(payload), '积分已入账')
      await refreshAll()
    },
    async redeemGift(payload) {
      await run(() => loyaltyApi.redeemGift(payload), '礼品已兑换')
      await refreshAll()
    },
    async issueBirthdayVouchers() {
      const vouchers = await run(() => loyaltyApi.issueBirthdayVouchers(), '生日礼券发放完成')
      await refreshAll()
      return vouchers
    }
  }
}
