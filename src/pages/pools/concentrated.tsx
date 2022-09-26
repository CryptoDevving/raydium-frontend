import { useMemo } from 'react'

import { twMerge } from 'tailwind-merge'

import useAppSettings from '@/application/appSettings/useAppSettings'
import { HydratedConcentratedInfo, UserPositionAccount } from '@/application/concentrated/type'
import useConcentrated, {
  PoolsConcentratedTabs,
  TimeBasis,
  useConcentratedFavoriteIds
} from '@/application/concentrated/useConcentrated'
import useNotification from '@/application/notification/useNotification'
import { isHydratedConcentratedItemInfo } from '@/application/pools/is'
import { usePools } from '@/application/pools/usePools'
import { routeTo } from '@/application/routeTools'
import useToken from '@/application/token/useToken'
import { decimalToFraction } from '@/application/txTools/decimal2Fraction'
import useWallet from '@/application/wallet/useWallet'
import AutoBox from '@/components/AutoBox'
import Button from '@/components/Button'
import Card from '@/components/Card'
import CoinAvatarPair from '@/components/CoinAvatarPair'
import Col from '@/components/Col'
import Collapse from '@/components/Collapse'
import CyberpunkStyleCard from '@/components/CyberpunkStyleCard'
import Grid from '@/components/Grid'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import LinkExplorer from '@/components/LinkExplorer'
import List from '@/components/List'
import LoadingCircle from '@/components/LoadingCircle'
import PageLayout from '@/components/PageLayout'
import Popover from '@/components/Popover'
import RefreshCircle from '@/components/RefreshCircle'
import Row from '@/components/Row'
import RowTabs from '@/components/RowTabs'
import Select from '@/components/Select'
import Tooltip from '@/components/Tooltip'
import { addItem, removeItem, shakeFalsyItem } from '@/functions/arrayMethods'
import copyToClipboard from '@/functions/dom/copyToClipboard'
import formatNumber from '@/functions/format/formatNumber'
import { shrinkAccount } from '@/functions/format/shrinkAccount'
import toPubString from '@/functions/format/toMintString'
import toPercentString from '@/functions/format/toPercentString'
import toTotalPrice from '@/functions/format/toTotalPrice'
import toUsdVolume from '@/functions/format/toUsdVolume'
import compare, { lt } from '@/functions/numberish/compare'
import { toString } from '@/functions/numberish/toString'
import { searchItems } from '@/functions/searchItems'
import useOnceEffect from '@/hooks/useOnceEffect'
import useSort from '@/hooks/useSort'

export default function PoolsConcentratedPage() {
  // usePoolSummeryInfoLoader()
  const currentTab = useConcentrated((s) => s.currentTab)
  return (
    <PageLayout
      mobileBarTitle={{
        items: [
          { value: PoolsConcentratedTabs.ALL, barLabel: PoolsConcentratedTabs.ALL },
          // { value: PoolsConcentratedTabs.STABLES, barLabel: PoolsConcentratedTabs.STABLES },
          // { value: PoolsConcentratedTabs.EXOTIC, barLabel: PoolsConcentratedTabs.EXOTIC },
          { value: PoolsConcentratedTabs.MY_POOLS, barLabel: PoolsConcentratedTabs.MY_POOLS }
        ],
        currentValue: currentTab,
        onChange: (value) => useConcentrated.setState({ currentTab: value as PoolsConcentratedTabs }),
        urlSearchQueryKey: 'tab',
        drawerTitle: 'CONCENTRATED POOLS'
      }}
      metaTitle="Concentrated Pools - Raydium"
    >
      <PoolHeader />
      <PoolCard />
    </PageLayout>
  )
}

function PoolHeader() {
  const tvl = useConcentrated((s) => s.tvl)
  const volume24h = useConcentrated((s) => s.volume24h)
  const showTvlVolume24h = Boolean(tvl != null && volume24h != null)
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    showTvlVolume24h ? (
      <Row className="mx-auto my-2 text-base mobile:text-xs justify-self-start self-end text-[#abc4ff80] gap-4">
        <div className="whitespace-nowrap">
          TVL: <span className="font-medium text-[#abc4ff]">${formatNumber(tvl)}</span>
        </div>
        <div className="whitespace-nowrap">
          Volume24H: <span className="font-medium text-[#abc4ff]">${formatNumber(volume24h)}</span>
        </div>
      </Row>
    ) : null
  ) : (
    <Grid className="grid-cols-3 justify-between items-center pb-8 pt-0">
      <>
        <div className="text-2xl font-semibold justify-self-start text-white">Concentrated Pools</div>
        {showTvlVolume24h && (
          <Row className="title text-base mobile:text-xs justify-self-start self-end text-[#abc4ff80] gap-4">
            <div className="whitespace-nowrap">
              TVL: <span className="font-medium text-[#abc4ff]">${formatNumber(tvl)}</span>
            </div>
            <div className="whitespace-nowrap">
              Volume24H: <span className="font-medium text-[#abc4ff]">${formatNumber(volume24h)}</span>
            </div>
          </Row>
        )}
      </>
      <PoolsTabBlock />
      <Row
        className={`justify-self-end self-center gap-1 flex-wrap items-center opacity-100 pointer-events-auto clickable transition`}
        onClick={() => {
          // routeTo('/liquidity/create')
        }}
      >
        {/* <Icon heroIconName="plus-circle" className="text-[#abc4ff]" size="sm" />
        <span className="text-[#abc4ff] font-medium text-sm mobile:text-xs">Create Pool</span> */}
      </Row>
    </Grid>
  )
}

function PoolsTabBlock({ className }: { className?: string }) {
  const currentTab = useConcentrated((s) => s.currentTab)
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    <RowTabs
      currentValue={currentTab}
      urlSearchQueryKey="tab"
      values={shakeFalsyItem([
        PoolsConcentratedTabs.ALL,
        // PoolsConcentratedTabs.STABLES,
        // PoolsConcentratedTabs.EXOTIC,
        PoolsConcentratedTabs.MY_POOLS
      ] as const)}
      onChange={(tab) => useConcentrated.setState({ currentTab: tab })}
      className={className}
    />
  ) : (
    <RowTabs
      currentValue={currentTab}
      urlSearchQueryKey="tab"
      values={shakeFalsyItem([
        PoolsConcentratedTabs.ALL,
        // PoolsConcentratedTabs.STABLES,
        // PoolsConcentratedTabs.EXOTIC,
        PoolsConcentratedTabs.MY_POOLS
      ] as const)}
      onChange={(tab) => useConcentrated.setState({ currentTab: tab })}
      className={twMerge('justify-self-center mobile:col-span-full', className)}
    />
  )
}

// TODO: add tab, ref farm page: ToolsButton
function ToolsButton({ className }: { className?: string }) {
  return (
    <>
      <Popover placement="bottom-right">
        <Popover.Button>
          <div className={twMerge('mx-1 rounded-full p-2 text-[#abc4ff] clickable justify-self-start', className)}>
            <Icon className="w-4 h-4" iconClassName="w-4 h-4" heroIconName="dots-vertical" />
          </div>
        </Popover.Button>
        <Popover.Panel>
          <div>
            <Card
              className="flex flex-col py-3 px-4  max-h-[80vh] border-1.5 border-[rgba(171,196,255,0.2)] bg-cyberpunk-card-bg shadow-cyberpunk-card"
              size="lg"
            >
              <Grid className="grid-cols-1 items-center gap-2">
                <PoolRefreshCircleBlock />
                <PoolTimeBasisSelectorBox />
              </Grid>
            </Card>
          </div>
        </Popover.Panel>
      </Popover>
    </>
  )
}

function PoolSearchBlock({ className }: { className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const storeSearchText = useConcentrated((s) => s.searchText)
  return (
    <Input
      value={storeSearchText}
      className={twMerge(
        'px-2 py-2 mobile:py-1 gap-2 ring-inset ring-1 ring-[rgba(196,214,255,0.5)] rounded-xl mobile:rounded-lg min-w-[6em]',
        className
      )}
      inputClassName="font-medium text-sm mobile:text-xs text-[rgba(196,214,255,0.5)] placeholder-[rgba(196,214,255,0.5)]"
      prefix={<Icon heroIconName="search" size={isMobile ? 'sm' : 'smi'} className="text-[rgba(196,214,255,0.5)]" />}
      suffix={
        <Icon
          heroIconName="x"
          size={isMobile ? 'xs' : 'sm'}
          className={`text-[rgba(196,214,255,0.5)] transition clickable ${
            storeSearchText ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => {
            useConcentrated.setState({ searchText: '' })
          }}
        />
      }
      placeholder="Search All"
      onUserInput={(searchText) => {
        useConcentrated.setState({ searchText })
      }}
    />
  )
}

function PoolLabelBlock({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="font-medium text-xl mobile:text-base text-white">Liquidity Pools</div>
      <div className="font-medium text-[rgba(196,214,255,.5)] text-base mobile:text-sm">
        Earn yield on trading fees by providing liquidity
      </div>
    </div>
  )
}

function PoolTimeBasisSelectorBox({ className }: { className?: string }) {
  const timeBasis = useConcentrated((s) => s.timeBasis)
  return (
    <Select
      className={twMerge('z-20', className)}
      candidateValues={Object.values(TimeBasis)}
      localStorageKey="ui-time-basis"
      defaultValue={timeBasis}
      prefix="Time Basis:"
      onChange={(newSortKey) => {
        useConcentrated.setState({ timeBasis: newSortKey ?? TimeBasis.WEEK })
      }}
    />
  )
}

function PoolTableSorterBox({
  className,
  onChange
}: {
  className?: string
  onChange?: (
    sortKey:
      | 'liquidity'
      | 'apr24h'
      | 'apr7d'
      | 'apr30d'
      | 'fee7d'
      | 'fee24h'
      | 'fee30d'
      | 'name'
      | 'volume7d'
      | 'volume24h'
      | 'volume30d'
      | 'favorite'
      | undefined
  ) => void
}) {
  const timeBasis = useConcentrated((s) => s.timeBasis)
  return (
    <Select
      className={className}
      candidateValues={[
        { label: 'Pool', value: 'name' },
        { label: 'Liquidity', value: 'liquidity' },
        {
          label: `Volume ${timeBasis}`,
          value: timeBasis === TimeBasis.DAY ? 'volume24h' : timeBasis === TimeBasis.WEEK ? 'volume7d' : 'volume30d'
        },
        {
          label: `Fees ${timeBasis}`,
          value: timeBasis === TimeBasis.DAY ? 'fee24h' : timeBasis === TimeBasis.WEEK ? 'fee7d' : 'fee30d'
        },
        {
          label: `APR ${timeBasis}`,
          value: timeBasis === TimeBasis.DAY ? 'apr24h' : timeBasis === TimeBasis.WEEK ? 'apr7d' : 'apr30d'
        },
        { label: 'Favorite', value: 'favorite' }
      ]}
      // defaultValue="apr"
      prefix="Sort by:"
      onChange={onChange}
    />
  )
}
function PoolRefreshCircleBlock({ className }: { className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const refreshConcentrated = useConcentrated((s) => s.refreshConcentrated)

  return useMemo(() => {
    if (isMobile) {
      return (
        <Row className={twMerge('items-center', className)}>
          <span className="text-[rgba(196,214,255,0.5)] font-medium text-sm mobile:text-xs">Refresh Pools</span>
          <RefreshCircle
            refreshKey="pools"
            freshFunction={() => {
              refreshConcentrated()
            }}
          />
        </Row>
      )
    }

    return (
      <div className={twMerge('justify-self-end', className)}>
        <RefreshCircle
          refreshKey="pools"
          freshFunction={() => {
            refreshConcentrated()
          }}
        />
      </div>
    )
  }, [isMobile, refreshConcentrated])
}

function PoolCard() {
  const balances = useWallet((s) => s.balances)
  const hydratedAmmPools = useConcentrated((s) => s.hydratedAmmPools)
  const searchText = useConcentrated((s) => s.searchText)
  const timeBasis = useConcentrated((s) => s.timeBasis)
  const currentTab = useConcentrated((s) => s.currentTab)

  const isMobile = useAppSettings((s) => s.isMobile)
  const [favouriteIds] = useConcentratedFavoriteIds()

  const dataSource = useMemo(
    () =>
      hydratedAmmPools.filter((pool) => {
        if (currentTab === PoolsConcentratedTabs.MY_POOLS) {
          return pool.userPositionAccount !== undefined ? true : false
        }
        return true
      }),
    [searchText, hydratedAmmPools, currentTab]
  )

  const searched = useMemo(
    () =>
      searchItems(dataSource, {
        text: searchText,
        matchConfigs: (i) => [
          { text: i.idString, entirely: false },
          { text: toPubString(i.base?.mint), entirely: true },
          { text: toPubString(i.quote?.mint), entirely: true },
          i.base?.symbol,
          i.quote?.symbol,
          i.base?.name,
          i.quote?.name
        ]
      }),
    [dataSource, searchText]
  )

  const {
    sortedData,
    setConfig: setSortConfig,
    sortConfig,
    clearSortConfig
  } = useSort(searched, {
    defaultSort: { key: 'defaultKey', sortCompare: [(i) => favouriteIds?.includes(i.idString), (i) => i.tvl] }
  })
  // re-sort when favourite have loaded
  useOnceEffect(
    ({ runed }) => {
      if (favouriteIds !== undefined) runed()
      if (favouriteIds != null) {
        setSortConfig({
          key: 'init',
          sortCompare: [(i) => favouriteIds?.includes(i.idString), (i) => i.tvl],
          mode: 'decrease'
        })
        runed()
      }
    },
    [favouriteIds]
  )

  const TableHeaderBlock = useMemo(
    () => (
      <Row
        type="grid-x"
        className="mb-3 h-12 justify-between sticky -top-6 backdrop-filter z-10 backdrop-blur-md bg-[rgba(20,16,65,0.2)] mr-scrollbar rounded-xl mobile:rounded-lg gap-2 grid-cols-[auto,1.6fr,1fr,1fr,1fr,.8fr,auto]"
      >
        <Row
          className="group w-20 pl-10 font-medium text-[#ABC4FF] text-sm items-center cursor-pointer  clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            setSortConfig({
              key: 'favorite',
              sortModeQueue: ['decrease', 'none'],
              sortCompare: [(i) => favouriteIds?.includes(i.idString), (i) => i.tvl]
            })
          }}
        >
          <Icon
            className={`ml-1 ${
              sortConfig?.key === 'favorite' && sortConfig.mode !== 'none'
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-30'
            } transition`}
            size="sm"
            iconSrc="/icons/msic-sort-only-down.svg"
          />
        </Row>

        {/* empty header */}
        <Grid className="grid-cols-[.4fr,1.2fr] clickable clickable-filter-effect no-clicable-transform-effect">
          <div></div>

          {/* table head column: Pool */}
          <Row
            className="font-medium text-[#ABC4FF] text-sm items-center cursor-pointer"
            onClick={() => {
              setSortConfig({
                key: 'name',
                sortModeQueue: ['increase', 'decrease', 'none'],
                sortCompare: (i) => i.name
              })
            }}
          >
            Pool
            <Icon
              className="ml-1"
              size="sm"
              iconSrc={
                sortConfig?.key === 'name' && sortConfig.mode !== 'none'
                  ? sortConfig?.mode === 'decrease'
                    ? '/icons/msic-sort-down.svg'
                    : '/icons/msic-sort-up.svg'
                  : '/icons/msic-sort.svg'
              }
            />
          </Row>
        </Grid>

        {/* table head column: liquidity */}
        <Row
          className="font-medium text-[#ABC4FF] text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            setSortConfig({ key: 'liquidity', sortCompare: (i) => i.tvl })
          }}
        >
          Liquidity
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key === 'liquidity' && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Row>

        {/* table head column: volume24h */}
        <Row
          className="font-medium text-[#ABC4FF] text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            const key =
              timeBasis === TimeBasis.DAY ? 'volume24h' : timeBasis === TimeBasis.WEEK ? 'volume7d' : 'volume30d'
            setSortConfig({ key, sortCompare: (i) => i[key] })
          }}
        >
          Volume {timeBasis}
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key.startsWith('volume') && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Row>

        {/* table head column: fee7d */}
        <Row
          className="font-medium text-[#ABC4FF] text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            const key = timeBasis === TimeBasis.DAY ? 'fee24h' : timeBasis === TimeBasis.WEEK ? 'fee7d' : 'fee30d'
            setSortConfig({ key, sortCompare: (i) => i[key] })
          }}
        >
          Fees {timeBasis}
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key.startsWith('fee') && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Row>

        {/* table head column: volume24h */}
        <Row
          className="font-medium text-[#ABC4FF] text-sm items-center cursor-pointer clickable clickable-filter-effect no-clicable-transform-effect"
          onClick={() => {
            setSortConfig({
              key: 'apr',
              sortCompare: (i) =>
                i.state[timeBasis === TimeBasis.DAY ? 'day' : timeBasis === TimeBasis.WEEK ? 'week' : 'month'].apr
            })
          }}
        >
          APR {timeBasis}
          <Tooltip>
            <Icon className="ml-1 cursor-help" size="sm" heroIconName="question-mark-circle" />
            <Tooltip.Panel>
              Estimated APR based on trading fees earned by the pool in the past {timeBasis}
            </Tooltip.Panel>
          </Tooltip>
          <Icon
            className="ml-1"
            size="sm"
            iconSrc={
              sortConfig?.key.startsWith('apr') && sortConfig.mode !== 'none'
                ? sortConfig?.mode === 'decrease'
                  ? '/icons/msic-sort-down.svg'
                  : '/icons/msic-sort-up.svg'
                : '/icons/msic-sort.svg'
            }
          />
        </Row>

        <PoolRefreshCircleBlock className="pr-8 self-center" />
      </Row>
    ),
    [sortConfig, timeBasis]
  )

  // NOTE: filter widgets
  const innerPoolDatabaseWidgets = isMobile ? (
    <div>
      <Row className="mb-4">
        <Grid className="grow gap-3 grid-cols-auto-fit">
          <PoolSearchBlock />
          <PoolTableSorterBox
            onChange={(newSortKey) => {
              newSortKey
                ? setSortConfig({
                    key: newSortKey,
                    sortCompare:
                      newSortKey === 'favorite' ? (i) => favouriteIds?.includes(i.idString) : (i) => i[newSortKey]
                  })
                : clearSortConfig()
            }}
          />
        </Grid>
        <ToolsButton className="self-center" />
      </Row>
    </div>
  ) : (
    <div>
      <Row className={'justify-between pb-5 gap-16 items-center'}>
        <PoolLabelBlock />
        <Row className="gap-6 items-stretch">
          <PoolTimeBasisSelectorBox />
          <PoolSearchBlock />
        </Row>
      </Row>
    </div>
  )
  return (
    <CyberpunkStyleCard
      haveMinHeight
      wrapperClassName="flex-1 overflow-hidden flex flex-col"
      className="p-10 pb-4 mobile:px-3 mobile:py-3 w-full flex flex-col flex-grow h-full"
    >
      {innerPoolDatabaseWidgets}
      {!isMobile && TableHeaderBlock}
      <PoolCardDatabaseBody sortedData={sortedData} />
    </CyberpunkStyleCard>
  )
}

function PoolCardDatabaseBody({ sortedData }: { sortedData: HydratedConcentratedInfo[] }) {
  const loading = useConcentrated((s) => s.loading)
  const expandedPoolId = useConcentrated((s) => s.expandedPoolId)
  const [favouriteIds, setFavouriteIds] = useConcentratedFavoriteIds()
  return sortedData.length ? (
    <List className="gap-3 mobile:gap-2 text-[#ABC4FF] flex-1 -mx-2 px-2" /* let scrollbar have some space */>
      {sortedData.map((info) => (
        <List.Item key={info.idString}>
          <Collapse open={expandedPoolId === info.idString ? true : false}>
            <Collapse.Face>
              {(open) => (
                <PoolCardDatabaseBodyCollapseItemFace
                  open={open}
                  info={info}
                  isFavourite={favouriteIds?.includes(info.idString)}
                  onUnFavorite={(ammId) => {
                    setFavouriteIds((ids) => removeItem(ids ?? [], ammId))
                  }}
                  onStartFavorite={(ammId) => {
                    setFavouriteIds((ids) => addItem(ids ?? [], ammId))
                  }}
                />
              )}
            </Collapse.Face>
            <Collapse.Body>
              <PoolCardDatabaseBodyCollapseItemContent poolInfo={info} />
            </Collapse.Body>
          </Collapse>
        </List.Item>
      ))}
    </List>
  ) : (
    <div className="text-center text-2xl p-12 opacity-50 text-[rgb(171,196,255)]">
      {loading ? <LoadingCircle /> : '(No results found)'}
    </div>
  )
}

function PoolCardDatabaseBodyCollapseItemFace({
  open,
  info,
  isFavourite,
  onUnFavorite,
  onStartFavorite
}: {
  open: boolean
  info: HydratedConcentratedInfo
  isFavourite?: boolean
  onUnFavorite?: (ammId: string) => void
  onStartFavorite?: (ammId: string) => void
}) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const isTablet = useAppSettings((s) => s.isTablet)
  const timeBasis = useConcentrated((s) => s.timeBasis)

  const pcCotent = (
    <Row
      type="grid-x"
      className={`py-5 mobile:py-4 mobile:px-5 bg-[#141041] items-center gap-2 grid-cols-[auto,1.6fr,1fr,1fr,1fr,.8fr,auto] mobile:grid-cols-[1fr,1fr,1fr,auto] rounded-t-3xl mobile:rounded-t-lg ${
        open ? '' : 'rounded-b-3xl mobile:rounded-b-lg'
      } transition-all`}
    >
      <div className="w-12 self-center ml-6 mr-2">
        {isFavourite ? (
          <Icon
            iconSrc="/icons/misc-star-filled.svg"
            onClick={({ ev }) => {
              ev.stopPropagation()
              onUnFavorite?.(info.idString)
            }}
            className="clickable clickable-mask-offset-2 m-auto self-center"
          />
        ) : (
          <Icon
            iconSrc="/icons/misc-star-empty.svg"
            onClick={({ ev }) => {
              ev.stopPropagation()
              onStartFavorite?.(info.idString)
            }}
            className="clickable clickable-mask-offset-2 opacity-30 hover:opacity-80 transition m-auto self-center"
          />
        )}
      </div>

      <CoinAvatarInfoItem info={info} className="pl-0" />

      <TextInfoItem
        name="Liquidity"
        value={
          isHydratedConcentratedItemInfo(info)
            ? toUsdVolume(info.tvl, { autoSuffix: isTablet, decimalPlace: 0 })
            : undefined
        }
      />
      <TextInfoItem
        name={`Volume(${timeBasis})`}
        value={
          isHydratedConcentratedItemInfo(info)
            ? timeBasis === TimeBasis.DAY
              ? toUsdVolume(info.volume24h, { autoSuffix: isTablet, decimalPlace: 0 })
              : timeBasis === TimeBasis.WEEK
              ? toUsdVolume(info.volume7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume(info.volume30d, { autoSuffix: isTablet, decimalPlace: 0 })
            : undefined
        }
      />
      <TextInfoItem
        name={`Fees(${timeBasis})`}
        value={
          isHydratedConcentratedItemInfo(info)
            ? timeBasis === TimeBasis.DAY
              ? toUsdVolume(info.fee24h, { autoSuffix: isTablet, decimalPlace: 0 })
              : timeBasis === TimeBasis.WEEK
              ? toUsdVolume(info.fee7d, { autoSuffix: isTablet, decimalPlace: 0 })
              : toUsdVolume(info.fee30d, { autoSuffix: isTablet, decimalPlace: 0 })
            : undefined
        }
      />
      <TextInfoItem
        name={`APR(${timeBasis})`}
        value={
          isHydratedConcentratedItemInfo(info)
            ? timeBasis === TimeBasis.DAY
              ? toPercentString(info.state.day.apr)
              : timeBasis === TimeBasis.WEEK
              ? toPercentString(info.state.week.apr)
              : toPercentString(info.state.month.apr)
            : undefined
        }
      />
      <Grid className="w-9 h-9 mr-8 place-items-center">
        <Icon size="sm" heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
      </Grid>
    </Row>
  )

  const mobileContent = (
    <Collapse open={open}>
      <Collapse.Face>
        <Row
          type="grid-x"
          className={`py-3 px-3 items-center gap-2 grid-cols-[auto,1.5fr,1fr,1fr,auto] bg-[#141041] mobile:rounded-t-lg ${
            open ? '' : 'rounded-b-3xl mobile:rounded-b-lg'
          }`}
        >
          <div className="w-8 self-center ">
            {isFavourite ? (
              <Icon
                className="clickable m-auto self-center"
                iconSrc="/icons/misc-star-filled.svg"
                onClick={({ ev }) => {
                  ev.stopPropagation()
                  onUnFavorite?.(info.idString)
                }}
                size="sm"
              />
            ) : (
              <Icon
                className="clickable opacity-30 hover:opacity-80 transition clickable-mask-offset-2 m-auto self-center"
                iconSrc="/icons/misc-star-empty.svg"
                onClick={({ ev }) => {
                  ev.stopPropagation()
                  onStartFavorite?.(info.idString)
                }}
                size="sm"
              />
            )}
          </div>

          <CoinAvatarInfoItem info={info} />

          <TextInfoItem
            name="Liquidity"
            value={
              isHydratedConcentratedItemInfo(info)
                ? toUsdVolume(info.tvl, { autoSuffix: true, decimalPlace: 1 })
                : undefined
            }
          />
          <TextInfoItem
            name={`APR(${timeBasis})`}
            value={
              isHydratedConcentratedItemInfo(info)
                ? timeBasis === TimeBasis.DAY
                  ? toPercentString(info.state.day.apr, { alreadyPercented: true })
                  : timeBasis === TimeBasis.WEEK
                  ? toPercentString(info.state.week.apr, { alreadyPercented: true })
                  : toPercentString(info.state.month.apr, { alreadyPercented: true })
                : undefined
            }
          />

          <Grid className="w-6 h-6 place-items-center">
            <Icon size="sm" heroIconName={`${open ? 'chevron-up' : 'chevron-down'}`} />
          </Grid>
        </Row>
      </Collapse.Face>

      <Collapse.Body>
        <Row
          type="grid-x"
          className="py-4 px-5 pl-12 relative items-center gap-2 grid-cols-[1.5fr,1fr,1fr,auto]  bg-[#141041]"
        >
          <div className="absolute top-0 left-5 right-5 border-[rgba(171,196,255,.2)] border-t-1.5"></div>
          <TextInfoItem
            name="Volume(7d)"
            value={
              isHydratedConcentratedItemInfo(info)
                ? toUsdVolume(info.volume7d, { autoSuffix: true, decimalPlace: 0 })
                : undefined
            }
          />
          <TextInfoItem
            name="Volume(24h)"
            value={
              isHydratedConcentratedItemInfo(info)
                ? toUsdVolume(info.volume24h, { autoSuffix: true, decimalPlace: 0 })
                : undefined
            }
          />
          <TextInfoItem
            name="Fees(7d)"
            value={
              isHydratedConcentratedItemInfo(info)
                ? toUsdVolume(info.fee7d, { autoSuffix: true, decimalPlace: 0 })
                : undefined
            }
          />

          <Grid className="w-6 h-6 place-items-center"></Grid>
        </Row>
      </Collapse.Body>
    </Collapse>
  )

  return isMobile ? mobileContent : pcCotent
}

function PoolCardDatabaseBodyCollapseItemContent({ poolInfo: info }: { poolInfo: HydratedConcentratedInfo }) {
  // eslint-disable-next-line no-console
  // console.log('info: ', info)

  const { lpPrices } = usePools()
  const tokenPrices = useToken((s) => s.tokenPrices)

  const variousPrices = useMemo(() => {
    return { ...lpPrices, ...tokenPrices }
  }, [lpPrices, tokenPrices])

  const openNewPosition = useMemo(() => {
    return (
      <AutoBox is={'Col'} className={`py-5 px-8 justify-center rounded-b-3xl mobile:rounded-b-lg items-center`}>
        <div style={{ marginBottom: 8, color: '#ABC4FF', fontWeight: 400, fontSize: 12, fontStyle: 'normal' }}>
          Want to open a new position?
        </div>
        <Button
          className="frosted-glass-teal"
          onClick={() => {
            // create
            useConcentrated.setState({ coin1: info.base, coin2: info.quote })
            routeTo('/liquidity/concentrated', {
              queryProps: {}
            })
          }}
        >
          Open New Position
        </Button>
      </AutoBox>
    )
  }, [info])

  return (
    <AutoBox
      is={'Col'}
      className={`justify-between rounded-b-3xl mobile:rounded-b-lg`}
      style={{
        background: 'linear-gradient(126.6deg, rgba(171, 196, 255, 0.12), rgb(171 196 255 / 4%) 100%)'
      }}
    >
      {info.userPositionAccount ? (
        <>
          {info.userPositionAccount.map((p, idx) => {
            let myPosition = '--'
            const amountA = toString(p.amountA, { decimalLength: 'auto 2' })
            const amountB = toString(p.amountB, { decimalLength: 'auto 2' })
            const lower = toString(p.priceLower, { decimalLength: 'auto 5' })
            const upper = toString(p.priceUpper, { decimalLength: 'auto 5' })

            if (lower && upper) {
              myPosition = lower + ' - ' + upper
            }

            // eslint-disable-next-line no-console
            // console.log('p: ', p)

            const coinAPrice = toTotalPrice(p.amountA, variousPrices[String(p.tokenA?.mint)] ?? null)
            const coinBPrice = toTotalPrice(p.amountA, variousPrices[String(p.tokenB?.mint)] ?? null)

            const myPositionPrice = coinAPrice.add(coinBPrice)
            const myPositionVolume = myPositionPrice ? toUsdVolume(myPositionPrice) : '--'
            const poolCurrentPrice = decimalToFraction(info.state.currentPrice)
            const inRange =
              compare('gte', poolCurrentPrice, p.priceLower) && compare('lte', poolCurrentPrice, p.priceUpper)

            // TODO: remove the comment out code below, they are for testing only
            // if (idx === 0) {
            //   useConcentrated.setState({
            //     currentAmmPool: info,
            //     targetUserPositionAccount: p
            //   })
            // }

            // const getCoinAmount = (pair: LiquidityAmountPair) => {
            //   // eslint-disable-next-line no-console
            //   console.log(
            //     'getCoinAmountA: ',
            //     pair.amountSlippageA.toNumber(),
            //     'getCoinAmountB: ',
            //     pair.amountSlippageB.toNumber()
            //   )
            // }

            return (
              // <>
              //   <PoolCardDatabaseBodyCollapsePositionContent
              //     key={p.nftMint.toString()}
              //     poolInfo={info}
              //     userPositionAccount={p}
              //     myPosition={myPosition}
              //     amountA={amountA}
              //     amountB={amountB}
              //   />
              //   <div className="px-3">
              //     <ConcentratedSliderInput getCoinAmount={getCoinAmount} />
              //   </div>
              // </>
              <PoolCardDatabaseBodyCollapsePositionContent
                key={p.nftMint.toString()}
                poolInfo={info}
                userPositionAccount={p}
                myPosition={myPosition}
                amountA={amountA}
                amountB={amountB}
                myPositionVolume={myPositionVolume}
                inRange={inRange}
              />
            )
          })}

          <AutoBox>{openNewPosition}</AutoBox>
        </>
      ) : (
        <>
          <PoolCardDatabaseBodyCollapsePositionContent poolInfo={info} />
          <AutoBox>{openNewPosition}</AutoBox>
        </>
      )}
    </AutoBox>
  )
}

function PoolCardDatabaseBodyCollapsePositionContent({
  poolInfo: info,
  userPositionAccount: p,
  myPosition: myPosition,
  amountA,
  amountB,
  myPositionVolume,
  inRange
}: {
  poolInfo: HydratedConcentratedInfo
  userPositionAccount?: UserPositionAccount
  myPosition?: string
  amountA?: string
  amountB?: string
  myPositionVolume?: string
  inRange?: boolean
}) {
  const isMobile = useAppSettings((s) => s.isMobile)

  const rangeTag = useMemo(() => {
    if (!inRange)
      return (
        <Row className="items-center bg-[#DA2EEF]/10 rounded text-xs text-[#DA2EEF] py-0.5 px-1 ml-2">
          <Icon size="xs" iconSrc={'/icons/warn-stick.svg'} />
          <div className="font-normal" style={{ marginLeft: 4 }}>
            Out of Range
          </div>
        </Row>
      )
    return (
      <Row className="items-center bg-[#142B45] rounded text-xs text-[#39D0D8] py-0.5 px-1 ml-2">
        <Icon size="xs" iconSrc={'/icons/check-circle.svg'} />
        <div className="font-normal" style={{ marginLeft: 4 }}>
          In Range
        </div>
      </Row>
    )
  }, [inRange])

  const { logInfo } = useNotification.getState()
  const walletConnected = useWallet((s) => s.connected)

  return (
    <AutoBox is={isMobile ? 'Col' : 'Row'}>
      <Row className={`w-full pt-5 px-8 mobile:py-3 mobile:px-4 mobile:m-0`}>
        <div
          className={`flex w-full pb-5 ${isMobile ? 'flex-col' : 'flex-row'}`}
          style={{ borderBottom: '1px solid rgba(171, 196, 255, .1)' }}
        >
          <AutoBox
            is={isMobile ? 'Grid' : 'Row'}
            className={`gap-[8px] mobile:gap-3 mobile:grid-cols-2-auto flex-grow justify-between`}
          >
            <Row className="flex-1 justify-between ring-inset ring-1 ring-[rgba(196,214,255,0.5)] rounded-3xl mobile:rounded-lg py-6 px-6  items-center">
              <Col>
                <div className="flex justify-start text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">
                  Price Range {inRange ? rangeTag : null}
                </div>
                <div className="text-white font-medium text-base mobile:text-xs mt-3">{myPosition ?? '--'}</div>
                <div className=" text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mt-2">
                  {info.base?.symbol} per {info.quote?.symbol}
                </div>
              </Col>
              <Col>
                <div className="flex justify-start text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">
                  My Position
                </div>
                <div className="text-white font-medium text-base mobile:text-xs mt-3">{myPositionVolume ?? '--'}</div>
                <Row className="items-center gap-1 text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mt-2">
                  {shrinkAccount(p?.nftMint, 6)}{' '}
                  <Icon
                    size="sm"
                    className={'clickable text-[rgba(171,196,255,1)] font-semibold'}
                    heroIconName="clipboard-copy"
                    onClick={({ ev }) => {
                      ev.stopPropagation()
                      copyToClipboard(toPubString(p?.nftMint))
                      logInfo('Account has been copied!')
                    }}
                  />
                  <LinkExplorer className="flex items-center" hrefDetail={`${p?.nftMint}`} type="account">
                    <Icon
                      size="sm"
                      className={'clickable text-[rgba(171,196,255,1)] font-semibold'}
                      inline
                      heroIconName="external-link"
                    />
                  </LinkExplorer>
                </Row>
              </Col>
              <Button
                className="frosted-glass-teal"
                onClick={() => {
                  useConcentrated.setState({ currentAmmPool: info, targetUserPositionAccount: p })
                  routeTo('/liquidity/my-position')
                }}
              >
                Manage Liquidity
              </Button>
            </Row>
            <Row className="flex-1  justify-between ring-inset ring-1 ring-[rgba(196,214,255,0.5)] rounded-3xl mobile:rounded-lg py-6 px-6  items-center">
              <Col>
                <div className="flex justify-start text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs">
                  Unclaimed Yield
                  <Tooltip darkGradient={true}>
                    <Icon className="ml-1 cursor-help" size="sm" heroIconName="question-mark-circle" />
                    <Tooltip.Panel>
                      <div className="max-w-[300px]">
                        Rewards are only emitted when LP tokens are staked in the farm. If there is a period when no LP
                        tokens are staked, unemmitted rewards can be claimed here once farming period ends
                      </div>
                    </Tooltip.Panel>
                  </Tooltip>
                </div>
                <div className="text-white font-medium text-base mobile:text-xs mt-3">{myPositionVolume ?? '--'}</div>
                <AutoBox
                  is="Row"
                  className="items-center gap-1 text-[rgba(171,196,255,0.5)] font-medium text-sm mobile:text-2xs mt-2"
                >
                  <Col className="text-[rgba(171,196,255,0.5)]">APR</Col>
                  <Col className="text-white">17.4%</Col>
                </AutoBox>
              </Col>
              <Col>
                <Button
                  className="frosted-glass-teal"
                  validators={[
                    {
                      should: walletConnected,
                      forceActive: true,
                      fallbackProps: {
                        onClick: () => useAppSettings.setState({ isWalletSelectorShown: true }),
                        children: 'Connect Wallet'
                      }
                    }
                  ]}
                  onClick={() => {
                    // create
                    useConcentrated.setState({ coin1: info.base, coin2: info.quote })
                    routeTo('/liquidity/concentrated', {
                      queryProps: {}
                    })
                  }}
                >
                  Harvest
                </Button>
              </Col>
            </Row>
          </AutoBox>
          <Row
            className={`pl-8 ${
              isMobile ? 'pr-8' : ''
            }  pt-5 gap-3 items-center self-center justify-center mobile:w-full`}
          >
            {isMobile ? (
              <Row className="gap-5">
                <Icon
                  size="sm"
                  heroIconName="plus"
                  className="grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] clickable clickable-filter-effect"
                  onClick={() => {
                    useConcentrated.setState({
                      isAddDialogOpen: true,
                      currentAmmPool: info,
                      targetUserPositionAccount: p
                    })
                    routeTo('/liquidity/concentrated', {
                      queryProps: {}
                    })
                  }}
                />
                <Icon
                  size="sm"
                  iconSrc="/icons/pools-remove-liquidity-entry.svg"
                  className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] 'clickable' clickable-filter-effect`}
                  onClick={() => {
                    useConcentrated.setState({
                      isRemoveDialogOpen: true,
                      currentAmmPool: info,
                      targetUserPositionAccount: p,
                      coin1: info.base,
                      coin2: info.quote
                    })
                    routeTo('/liquidity/concentrated', {
                      queryProps: {}
                    })
                  }}
                />
              </Row>
            ) : (
              <>
                <Tooltip>
                  <Icon
                    size="smi"
                    heroIconName="plus"
                    className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] opacity-100 clickable clickable-filter-effect ${
                      p ? 'opacity-100 clickable clickable-filter-effect' : 'opacity-50 not-clickable'
                    }`}
                    onClick={() => {
                      useConcentrated.setState({
                        isAddDialogOpen: true,
                        currentAmmPool: info,
                        targetUserPositionAccount: p
                      })
                      routeTo('/liquidity/concentrated', {
                        queryProps: {}
                      })
                    }}
                  />
                  <Tooltip.Panel>Add Liquidity</Tooltip.Panel>
                </Tooltip>
                <Tooltip>
                  <Icon
                    size="smi"
                    iconSrc="/icons/pools-remove-liquidity-entry.svg"
                    className={`grid place-items-center w-10 h-10 mobile:w-8 mobile:h-8 ring-inset ring-1 mobile:ring-1 ring-[rgba(171,196,255,.5)] rounded-xl mobile:rounded-lg text-[rgba(171,196,255,.5)] ${
                      p ? 'opacity-100 clickable clickable-filter-effect' : 'opacity-50 not-clickable'
                    }`}
                    onClick={() => {
                      useConcentrated.setState({
                        isRemoveDialogOpen: true,
                        currentAmmPool: info,
                        targetUserPositionAccount: p,
                        coin1: info.base,
                        coin2: info.quote
                      })
                      routeTo('/liquidity/concentrated', {
                        queryProps: {}
                      })
                    }}
                  />
                  <Tooltip.Panel>Remove Liquidity</Tooltip.Panel>
                </Tooltip>
              </>
            )}
          </Row>
        </div>
      </Row>
    </AutoBox>
  )
}

function CoinAvatarInfoItem({ info, className }: { info: HydratedConcentratedInfo | undefined; className?: string }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  const lowLiquidityAlertText = `This pool has relatively low liquidity. Always check the quoted price and that the pool has sufficient liquidity before trading.`

  return (
    <AutoBox
      is={isMobile ? 'Col' : 'Row'}
      className={twMerge('clickable flex-wrap items-center mobile:items-start', className)}
    >
      <CoinAvatarPair
        className="justify-self-center mr-2"
        size={isMobile ? 'sm' : 'md'}
        token1={info?.base}
        token2={info?.quote}
      />
      <Row className="mobile:text-xs font-medium mobile:mt-px items-center flex-wrap gap-2">
        {info?.name}
        {/* {info?.isStablePool && <Badge className="self-center">Stable</Badge>} */}
        {lt(toString(info?.tvl, { decimalLength: 'auto 0' }) ?? 0, 100000) && (
          <Tooltip placement="right">
            <Icon size="sm" heroIconName="question-mark-circle" className="cursor-help" />
            <Tooltip.Panel>
              <div className="whitespace-pre">{lowLiquidityAlertText}</div>
            </Tooltip.Panel>
          </Tooltip>
        )}
      </Row>
    </AutoBox>
  )
}

function TextInfoItem({ name, value }: { name: string; value?: any }) {
  const isMobile = useAppSettings((s) => s.isMobile)
  return isMobile ? (
    <div>
      <div className="mb-1 text-[rgba(171,196,255,0.5)] font-medium text-2xs">{name}</div>
      <div className="text-xs">{value || '--'}</div>
    </div>
  ) : (
    <div className="tablet:text-sm">{value || '--'}</div>
  )
}
