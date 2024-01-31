package transaction

import (
	"context"
	"database/sql"
	"fmt"
)

type Transaction interface {
	DoInTx(context.Context, func(context.Context) (any, error)) (any, error)
}

type tx struct {
	db *sql.DB
}

func NewTransaction(db *sql.DB) Transaction {
	return &tx{db}
}

func (t *tx) DoInTx(ctx context.Context, f func(context.Context) (any, error)) (any, error) {
	tx, err := t.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, err
	}

	ctx = context.WithValue(ctx, "tx", tx)
	v, err := f(ctx)
	if err != nil {
		fmt.Println("RollBack1")
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		fmt.Println("RollBack2")
		tx.Rollback()
		return nil, err
	}

	return v, nil
}
