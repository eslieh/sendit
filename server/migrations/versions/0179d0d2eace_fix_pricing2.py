"""fix pricing2

Revision ID: 0179d0d2eace
Revises: a88e96a0ccd3
Create Date: 2025-02-19 16:10:58.540512

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0179d0d2eace'
down_revision = 'a88e96a0ccd3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('delivery', schema=None) as batch_op:
        batch_op.add_column(sa.Column('pricing', sa.Float(), nullable=False, server_default='0.0'))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('delivery', schema=None) as batch_op:
        batch_op.drop_column('pricing')

    # ### end Alembic commands ###
