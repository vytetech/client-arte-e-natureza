ALTER TABLE "works" ALTER COLUMN "status" SET DEFAULT 'available';

UPDATE "works"
SET "status" = CASE
  WHEN "status" IN ('DISPONÍVEL', 'Disponível', 'disponível', 'DISPONIVEL', 'Disponivel', 'disponivel', 'available') THEN 'available'
  WHEN "status" IN ('VENDIDO', 'Vendido', 'vendido', 'Vendida', 'vendida', 'sold') THEN 'sold'
  WHEN "status" IN ('RESERVADO', 'Reservado', 'reservado', 'Reservada', 'reservada', 'reserved') THEN 'reserved'
  WHEN "status" IN ('INDISPONÍVEL', 'Indisponível', 'indisponível', 'INDISPONIVEL', 'Indisponivel', 'indisponivel', 'NO JARDIM', 'No jardim', 'no jardim', 'unavailable') THEN 'unavailable'
  ELSE "status"
END
WHERE "status" IN (
  'DISPONÍVEL', 'Disponível', 'disponível', 'DISPONIVEL', 'Disponivel', 'disponivel', 'available',
  'VENDIDO', 'Vendido', 'vendido', 'Vendida', 'vendida', 'sold',
  'RESERVADO', 'Reservado', 'reservado', 'Reservada', 'reservada', 'reserved',
  'INDISPONÍVEL', 'Indisponível', 'indisponível', 'INDISPONIVEL', 'Indisponivel', 'indisponivel',
  'NO JARDIM', 'No jardim', 'no jardim', 'unavailable'
);
