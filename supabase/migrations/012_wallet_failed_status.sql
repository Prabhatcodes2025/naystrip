-- Record definitive Cashfree terminal states without affecting paid credits.
alter table public.agent_wallet_orders drop constraint if exists agent_wallet_orders_status_check;
alter table public.agent_wallet_orders add constraint agent_wallet_orders_status_check check(status in ('created','paid','failed'));
