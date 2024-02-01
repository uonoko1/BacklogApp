package usecase

import (
	"backend/model"
	"backend/repository"
	"context"
)

type FavUsecase interface {
	AddProjectToFavoriteList(ctx context.Context, userId, id int) error
	RemoveProjectFromFavoriteList(ctx context.Context, userId, id int) error
	AddTaskToFavoriteList(ctx context.Context, userId, id int) error
	RemoveTaskFromFavoriteList(ctx context.Context, userId, id int) error
	GetFavoriteProjects(ctx context.Context, userId int) ([]model.FavoriteProject, error)
	GetFavoriteTasks(ctx context.Context, userId int) ([]model.FavoriteTask, error)
}

type favUsecase struct {
	r repository.FavRepository
}

func NewFavUsecase(r repository.FavRepository) FavUsecase {
	return &favUsecase{r}
}

func (f *favUsecase) AddProjectToFavoriteList(ctx context.Context, userId, id int) error {
	err := f.r.AddProjectToFavoriteList(ctx, userId, id)
	if err != nil {
		return err
	}

	return nil
}

func (f *favUsecase) RemoveProjectFromFavoriteList(ctx context.Context, userId, id int) error {
	err := f.r.RemoveProjectFromFavoriteList(ctx, userId, id)
	if err != nil {
		return err
	}

	return nil
}

func (f *favUsecase) AddTaskToFavoriteList(ctx context.Context, userId, id int) error {
	err := f.r.AddTaskToFavoriteList(ctx, userId, id)
	if err != nil {
		return err
	}

	return nil
}

func (f *favUsecase) RemoveTaskFromFavoriteList(ctx context.Context, userId, id int) error {
	err := f.r.RemoveTaskFromFavoriteList(ctx, userId, id)
	if err != nil {
		return err
	}

	return nil
}

func (f *favUsecase) GetFavoriteProjects(ctx context.Context, userId int) ([]model.FavoriteProject, error) {
	favoriteProjects, err := f.r.GetFavoriteProjects(ctx, userId)
	if err != nil {
		return nil, err
	}

	return favoriteProjects, nil
}

func (f *favUsecase) GetFavoriteTasks(ctx context.Context, userId int) ([]model.FavoriteTask, error) {
	favoriteTasks, err := f.r.GetFavoriteTasks(ctx, userId)
	if err != nil {
		return nil, err
	}

	return favoriteTasks, nil
}
