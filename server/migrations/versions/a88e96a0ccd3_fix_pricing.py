"""fix pricing

Revision ID: a88e96a0ccd3
Revises: eafaaa0ddba4
Create Date: 2025-02-19 16:07:51.887959

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a88e96a0ccd3'
down_revision = 'eafaaa0ddba4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('delivery', schema=None) as batch_op:
        batch_op.drop_column('pricing')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('delivery', schema=None) as batch_op:
        batch_op.add_column(sa.Column('pricing', sa.FLOAT(), nullable=False))

    # ### end Alembic commands ###
