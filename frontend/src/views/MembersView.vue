<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import StatusBanner from '../components/StatusBanner.vue'
import MetricCard from '../components/MetricCard.vue'
import { useLoyaltyData } from '../stores/useLoyaltyData'

const { state, filter, refreshAll, refreshMembersWithFilter, resetFilter, createMember } = useLoyaltyData()
const form = reactive({ name: '', phone: '', birthday: '2000-01-01' })
const filterError = ref('')

const months = [
  { value: 1, label: '1月' },
  { value: 2, label: '2月' },
  { value: 3, label: '3月' },
  { value: 4, label: '4月' },
  { value: 5, label: '5月' },
  { value: 6, label: '6月' },
  { value: 7, label: '7月' },
  { value: 8, label: '8月' },
  { value: 9, label: '9月' },
  { value: 10, label: '10月' },
  { value: 11, label: '11月' },
  { value: 12, label: '12月' }
]

const hasActiveFilter = computed(() => {
  return (filter.tier_id != null && filter.tier_id !== '' && !isNaN(filter.tier_id)) ||
    (filter.points_min != null && filter.points_min !== '' && !isNaN(filter.points_min)) ||
    (filter.points_max != null && filter.points_max !== '' && !isNaN(filter.points_max)) ||
    (filter.birthday_month != null && filter.birthday_month !== '' && !isNaN(filter.birthday_month)) ||
    (filter.phone != null && filter.phone !== '')
})

onMounted(refreshAll)

async function submitMember() {
  await createMember({ ...form })
  Object.assign(form, { name: '', phone: '', birthday: '2000-01-01' })
}

function validateFilter() {
  const min = Number(filter.points_min)
  const max = Number(filter.points_max)
  const hasMin = filter.points_min != null && filter.points_min !== '' && !isNaN(filter.points_min)
  const hasMax = filter.points_max != null && filter.points_max !== '' && !isNaN(filter.points_max)
  if (hasMin && hasMax && min > max) {
    filterError.value = '最低积分不能大于最高积分，请检查积分区间'
    return false
  }
  filterError.value = ''
  return true
}

async function applyFilter() {
  if (!validateFilter()) return
  await refreshMembersWithFilter()
}

async function clearFilter() {
  filterError.value = ''
  resetFilter()
  await refreshMembersWithFilter()
}
</script>

<template>
  <section class="view-stack">
    <div class="section-header">
      <div>
        <p class="eyebrow">Members</p>
        <h2>会员管理</h2>
      </div>
      <StatusBanner :error="state.error" :notice="state.notice" :loading="state.loading" />
    </div>

    <div class="metrics-grid">
      <MetricCard label="会员数" :value="state.dashboard?.members_count || 0" hint="筛选结果" />
      <MetricCard label="积分池" :value="state.dashboard?.total_points || 0" hint="筛选结果" />
      <MetricCard label="礼品" :value="state.dashboard?.gifts_count || 0" hint="可兑换项目" />
      <MetricCard label="礼券" :value="state.dashboard?.active_vouchers || 0" hint="筛选会员未使用券" />
    </div>

    <section class="panel">
      <h3>组合筛选</h3>
      <div v-if="filterError" class="filter-error">
        <span>{{ filterError }}</span>
      </div>
      <div class="filter-form">
        <label>
          等级
          <select v-model.number="filter.tier_id">
            <option :value="''">全部等级</option>
            <option v-for="tier in state.tiers" :key="tier.id" :value="tier.id">
              {{ tier.name }}
            </option>
          </select>
        </label>
        <label :class="{ 'has-error': filterError }">
          最低积分
          <input v-model.number="filter.points_min" type="number" min="0" placeholder="积分下限" />
        </label>
        <label :class="{ 'has-error': filterError }">
          最高积分
          <input v-model.number="filter.points_max" type="number" min="0" placeholder="积分上限" />
        </label>
        <label>
          生日月份
          <select v-model.number="filter.birthday_month">
            <option :value="''">全部月份</option>
            <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </label>
        <label>
          手机号
          <input v-model.trim="filter.phone" type="text" placeholder="模糊匹配" />
        </label>
        <div class="filter-actions">
          <button class="primary-button" type="button" @click="applyFilter">查询</button>
          <button class="ghost-button" type="button" @click="clearFilter">重置</button>
        </div>
      </div>
    </section>

    <div class="two-column">
      <form class="panel" @submit.prevent="submitMember">
        <h3>新增会员</h3>
        <label>
          姓名
          <input v-model.trim="form.name" required type="text" />
        </label>
        <label>
          手机号
          <input v-model.trim="form.phone" required type="tel" />
        </label>
        <label>
          生日
          <input v-model="form.birthday" required type="date" />
        </label>
        <button class="primary-button" type="submit">创建会员</button>
      </form>

      <section class="panel wide-panel">
        <h3>会员列表 <small class="count-badge">共 {{ state.members.length }} 条</small></h3>
        <div class="data-table">
          <div class="table-head">
            <span>会员</span>
            <span>等级</span>
            <span>积分</span>
            <span>权益</span>
          </div>
          <div v-for="member in state.members" :key="member.id" class="table-row">
            <span>{{ member.name }}<small>{{ member.phone }}</small></span>
            <span>{{ member.tier_name }}</span>
            <span>{{ member.points }}</span>
            <span>{{ member.benefits.join('、') }}</span>
          </div>
          <div v-if="!state.members.length" class="empty-row">
            <span>暂无符合条件的会员</span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
