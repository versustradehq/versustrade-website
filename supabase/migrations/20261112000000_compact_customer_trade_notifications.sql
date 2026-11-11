alter table public.customer_notifications
  add column if not exists asset_name text,
  add column if not exists trade_category text,
  add column if not exists trade_action text,
  add column if not exists amount_value numeric,
  add column if not exists amount_currency text;

create or replace function public.notify_customer_trade_event()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  event_key text;
  event_title text;
  event_message text;
  category text;
  action text;
  display_asset text;
  display_amount numeric;
  display_currency text;
begin
  if new.transaction_type = 'GIFT_CARD_SELL' then
    category := 'Gift Card';
    action := 'Sell';
    display_asset := coalesce(new.card_brand, 'Gift Card');
    display_amount := new.card_value;
    display_currency := new.card_currency;
  else
    category := 'Crypto';
    action := case new.transaction_type when 'CRYPTO_BUY' then 'Buy' when 'CRYPTO_SELL' then 'Sell' else 'Trade' end;
    display_asset := new.asset;
    display_amount := new.crypto_amount;
    display_currency := new.asset;
  end if;

  if tg_op = 'INSERT' then
    event_key := 'TRADE_CREATED';
    event_title := 'Trade received';
    event_message := 'Your trade ' || new.reference || ' has been registered.';
    insert into public.customer_notifications(user_id,transaction_id,reference,event_type,title,message,status,asset_name,trade_category,trade_action,amount_value,amount_currency)
    values(new.customer_id,new.id,new.reference,event_key,event_title,event_message,new.status,display_asset,category,action,display_amount,display_currency);
    return new;
  end if;

  if new.status is distinct from old.status then
    event_key := 'STATUS_CHANGED';
    event_title := 'Trade status updated';
    event_message := 'Your trade ' || new.reference || ' status has changed.';
    insert into public.customer_notifications(user_id,transaction_id,reference,event_type,title,message,status,asset_name,trade_category,trade_action,amount_value,amount_currency)
    values(new.customer_id,new.id,new.reference,event_key,event_title,event_message,new.status,display_asset,category,action,display_amount,display_currency);
  end if;
  return new;
end;
$$;

update public.customer_notifications n
set asset_name = case when t.transaction_type = 'GIFT_CARD_SELL' then coalesce(t.card_brand,'Gift Card') else t.asset end,
    trade_category = case when t.transaction_type = 'GIFT_CARD_SELL' then 'Gift Card' else 'Crypto' end,
    trade_action = case t.transaction_type when 'CRYPTO_BUY' then 'Buy' when 'CRYPTO_SELL' then 'Sell' when 'GIFT_CARD_SELL' then 'Sell' else 'Trade' end,
    amount_value = case when t.transaction_type = 'GIFT_CARD_SELL' then t.card_value else t.crypto_amount end,
    amount_currency = case when t.transaction_type = 'GIFT_CARD_SELL' then t.card_currency else t.asset end
from public.transactions t
where n.transaction_id=t.id
  and (n.asset_name is null or n.trade_category is null or n.trade_action is null or n.amount_value is null or n.amount_currency is null);
